# AWS Deployment Guide - Dating Application

## Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Docker installed locally
- Domain name configured

## Architecture Overview
```
Route 53 (DNS) 
    ↓
Application Load Balancer (ALB)
    ↓
ECS Fargate Cluster
    ├── Frontend Service (Next.js)
    ├── Backend Service (Express)
    └── Database (RDS PostgreSQL)
```

## Step 1: Prepare AWS Resources

### 1.1 Create VPC and Networking
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=dating-app-vpc}]'

# Create Subnets (2 public, 2 private across 2 AZs)
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 10.0.2.0/24 --availability-zone us-east-1b
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 10.0.3.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 10.0.4.0/24 --availability-zone us-east-1b

# Create Internet Gateway
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=dating-igw}]'
aws ec2 attach-internet-gateway --internet-gateway-id <IGW_ID> --vpc-id <VPC_ID>
```

### 1.2 Create RDS PostgreSQL Database
```bash
# Create DB Subnet Group
aws rds create-db-subnet-group \
    --db-subnet-group-name dating-db-subnet \
    --db-subnet-group-description "Dating app database subnet" \
    --subnet-ids <PRIVATE_SUBNET_1_ID> <PRIVATE_SUBNET_2_ID>

# Create RDS Instance
aws rds create-db-instance \
    --db-instance-identifier dating-postgres \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.3 \
    --master-username admin \
    --master-user-password <SECURE_PASSWORD> \
    --allocated-storage 20 \
    --storage-type gp3 \
    --db-subnet-group-name dating-db-subnet \
    --vpc-security-group-ids <SECURITY_GROUP_ID> \
    --backup-retention-period 7 \
    --preferred-backup-window "03:00-04:00" \
    --preferred-maintenance-window "mon:04:00-mon:05:00" \
    --publicly-accessible false \
    --storage-encrypted
```

### 1.3 Create ECR Repositories
```bash
# Create repositories for images
aws ecr create-repository --repository-name dating-frontend
aws ecr create-repository --repository-name dating-backend
```

## Step 2: Build and Push Docker Images

### 2.1 Login to ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

### 2.2 Build and Push Backend
```bash
cd backend
docker build -t dating-backend .
docker tag dating-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-backend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-backend:latest
```

### 2.3 Build and Push Frontend
```bash
cd ../frontend
docker build \
    --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
    --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=<YOUR_KEY> \
    -t dating-frontend .
docker tag dating-frontend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-frontend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-frontend:latest
```

## Step 3: Create ECS Cluster

### 3.1 Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name dating-cluster --capacity-providers FARGATE FARGATE_SPOT
```

### 3.2 Create Task Execution Role
```bash
# Create role
aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file://trust-policy.json

# Attach policy
aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### 3.3 Store Secrets in AWS Secrets Manager
```bash
# Database URL
aws secretsmanager create-secret \
    --name dating/database-url \
    --secret-string "postgresql://admin:<PASSWORD>@<RDS_ENDPOINT>:5432/dating"

# JWT Secret
aws secretsmanager create-secret \
    --name dating/jwt-secret \
    --secret-string "<GENERATE_SECURE_SECRET>"

# Other secrets...
```

## Step 4: Create Task Definitions

### 4.1 Backend Task Definition (backend-task-definition.json)
```json
{
  "family": "dating-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:dating/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:dating/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/dating-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:5000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### 4.2 Register Task Definitions
```bash
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json
aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json
```

## Step 5: Create Application Load Balancer

### 5.1 Create ALB
```bash
aws elbv2 create-load-balancer \
    --name dating-alb \
    --subnets <PUBLIC_SUBNET_1> <PUBLIC_SUBNET_2> \
    --security-groups <ALB_SECURITY_GROUP> \
    --scheme internet-facing \
    --type application \
    --ip-address-type ipv4
```

### 5.2 Create Target Groups
```bash
# Backend target group
aws elbv2 create-target-group \
    --name dating-backend-tg \
    --protocol HTTP \
    --port 5000 \
    --vpc-id <VPC_ID> \
    --target-type ip \
    --health-check-path /health \
    --health-check-interval-seconds 30

# Frontend target group
aws elbv2 create-target-group \
    --name dating-frontend-tg \
    --protocol HTTP \
    --port 3000 \
    --vpc-id <VPC_ID> \
    --target-type ip \
    --health-check-path /
```

### 5.3 Create Listeners
```bash
# HTTPS Listener
aws elbv2 create-listener \
    --load-balancer-arn <ALB_ARN> \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=<ACM_CERT_ARN> \
    --default-actions Type=forward,TargetGroupArn=<FRONTEND_TG_ARN>

# Add rule for API routes
aws elbv2 create-rule \
    --listener-arn <LISTENER_ARN> \
    --priority 1 \
    --conditions Field=path-pattern,Values='/api/*' \
    --actions Type=forward,TargetGroupArn=<BACKEND_TG_ARN>
```

## Step 6: Create ECS Services

### 6.1 Backend Service
```bash
aws ecs create-service \
    --cluster dating-cluster \
    --service-name dating-backend \
    --task-definition dating-backend \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[<PRIVATE_SUBNET_1>,<PRIVATE_SUBNET_2>],securityGroups=[<BACKEND_SG>],assignPublicIp=DISABLED}" \
    --load-balancers "targetGroupArn=<BACKEND_TG_ARN>,containerName=backend,containerPort=5000" \
    --health-check-grace-period-seconds 60
```

### 6.2 Frontend Service
```bash
aws ecs create-service \
    --cluster dating-cluster \
    --service-name dating-frontend \
    --task-definition dating-frontend \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[<PRIVATE_SUBNET_1>,<PRIVATE_SUBNET_2>],securityGroups=[<FRONTEND_SG>],assignPublicIp=DISABLED}" \
    --load-balancers "targetGroupArn=<FRONTEND_TG_ARN>,containerName=frontend,containerPort=3000" \
    --health-check-grace-period-seconds 60
```

## Step 7: Configure Auto Scaling

### 7.1 Register Scalable Targets
```bash
# Backend auto scaling
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/dating-cluster/dating-backend \
    --min-capacity 2 \
    --max-capacity 10

# Frontend auto scaling
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/dating-cluster/dating-frontend \
    --min-capacity 2 \
    --max-capacity 10
```

### 7.2 Create Scaling Policies
```bash
# CPU-based scaling
aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/dating-cluster/dating-backend \
    --policy-name cpu-scaling \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

## Step 8: Configure DNS

### 8.1 Create Route 53 Records
```bash
# Main domain
aws route53 change-resource-record-sets \
    --hosted-zone-id <HOSTED_ZONE_ID> \
    --change-batch file://dns-change.json

# API subdomain
# Point api.yourdomain.com to ALB DNS
```

## Step 9: Run Database Migrations

### 9.1 Connect to Bastion Host or Run Migration Task
```bash
# Option 1: Run migration from bastion host
ssh -i your-key.pem ec2-user@<BASTION_IP>
cd /app
npx prisma migrate deploy

# Option 2: Run one-off ECS task
aws ecs run-task \
    --cluster dating-cluster \
    --task-definition dating-backend \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[<SUBNET>],securityGroups=[<SG>]}" \
    --overrides '{"containerOverrides":[{"name":"backend","command":["npx","prisma","migrate","deploy"]}]}'
```

## Step 10: Monitoring and Logging

### 10.1 Enable CloudWatch Logs
```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/dating-backend
aws logs create-log-group --log-group-name /ecs/dating-frontend
```

### 10.2 Set up CloudWatch Alarms
```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
    --alarm-name dating-backend-high-cpu \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=ServiceName,Value=dating-backend Name=ClusterName,Value=dating-cluster \
    --evaluation-periods 2
```

## Cost Optimization

### Estimated Monthly Costs:
- **ECS Fargate (4 tasks):** ~$80-100
- **RDS db.t3.micro:** ~$15-20
- **Application Load Balancer:** ~$20-25
- **Data Transfer:** ~$10-20
- **CloudWatch Logs:** ~$5-10
- **Route 53:** ~$1-2

**Total:** ~$130-180/month (small-scale deployment)

### Cost Saving Tips:
1. Use Fargate Spot for non-critical tasks (50-70% savings)
2. Enable RDS auto-scaling storage
3. Use S3 + CloudFront for static assets
4. Set up CloudWatch log retention policies
5. Use reserved capacity for predictable workloads

## Security Checklist

- ✅ Enable VPC Flow Logs
- ✅ Use AWS Secrets Manager for sensitive data
- ✅ Enable RDS encryption at rest
- ✅ Configure security groups (least privilege)
- ✅ Enable ALB access logs
- ✅ Use ACM for SSL/TLS certificates
- ✅ Enable AWS WAF on ALB
- ✅ Configure backup policies for RDS
- ✅ Enable CloudTrail for audit logs
- ✅ Set up IAM roles with minimal permissions

## Rollback Strategy

### Quick Rollback
```bash
# Rollback to previous task definition
aws ecs update-service \
    --cluster dating-cluster \
    --service dating-backend \
    --task-definition dating-backend:PREVIOUS_VERSION
```

### Database Rollback
```bash
# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier dating-postgres-restored \
    --db-snapshot-identifier dating-postgres-snapshot-TIMESTAMP
```

## CI/CD Pipeline (GitHub Actions)

See `.github/workflows/deploy-aws.yml` for automated deployment pipeline.

## Troubleshooting

### Common Issues:

1. **Tasks failing health checks:**
   - Check CloudWatch logs
   - Verify security group rules
   - Check environment variables

2. **Database connection issues:**
   - Verify RDS security group allows ECS tasks
   - Check DATABASE_URL format
   - Ensure RDS is in same VPC

3. **High latency:**
   - Enable ALB connection draining
   - Increase task count
   - Add caching layer (ElastiCache)

## Support

For issues, contact: support@yourdomain.com
Documentation: https://docs.yourdomain.com
