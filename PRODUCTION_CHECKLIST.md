# Production Deployment Checklist

## Pre-Deployment Tasks

### 1. Environment Configuration ✅
- [ ] All environment variables configured in AWS Secrets Manager
- [ ] `.env.production` files created for frontend and backend
- [ ] Firebase credentials configured
- [ ] Cloudinary API keys set
- [ ] Ably API keys configured
- [ ] SMTP credentials for email service
- [ ] JWT secret generated (minimum 32 characters)
- [ ] ALLOWED_ORIGINS whitelist configured

### 2. Database Setup ✅
- [ ] RDS PostgreSQL instance created
- [ ] Database security group configured
- [ ] Backup retention policy set (7-30 days recommended)
- [ ] Automated backups enabled
- [ ] Encryption at rest enabled
- [ ] Database connection string added to Secrets Manager
- [ ] Database indexes created (run `npx prisma migrate deploy`)

### 3. AWS Infrastructure ✅
- [ ] VPC created with public and private subnets
- [ ] Internet Gateway attached
- [ ] NAT Gateway configured for private subnets
- [ ] Security groups created and configured
- [ ] ECR repositories created (dating-frontend, dating-backend)
- [ ] ECS Cluster created (dating-cluster)
- [ ] Task execution roles created with necessary permissions
- [ ] Application Load Balancer created
- [ ] Target groups configured with health checks
- [ ] SSL/TLS certificate obtained (AWS Certificate Manager)

### 4. Docker Images ✅
- [ ] Backend Dockerfile tested locally
- [ ] Frontend Dockerfile tested locally
- [ ] Images built with production environment variables
- [ ] Images tagged with version numbers
- [ ] Images pushed to ECR
- [ ] Health check endpoints working (/health for backend, / for frontend)

### 5. Security Hardening ✅
- [ ] Rate limiting configured (100 req/15min general, 5 req/15min auth)
- [ ] CORS whitelist configured
- [ ] Helmet security headers enabled
- [ ] HTTPS enforcement configured
- [ ] SSL/TLS certificates installed
- [ ] Security groups follow least privilege principle
- [ ] IAM roles have minimal required permissions
- [ ] Database credentials rotated
- [ ] API keys secured in Secrets Manager
- [ ] AWS WAF configured (optional but recommended)

### 6. Monitoring & Logging ✅
- [ ] CloudWatch log groups created
- [ ] Log retention policies set (30 days recommended)
- [ ] CloudWatch alarms configured:
  - [ ] High CPU utilization (>80%)
  - [ ] High memory utilization (>80%)
  - [ ] Failed health checks
  - [ ] 5xx error rate
  - [ ] Database connection failures
- [ ] CloudWatch dashboards created
- [ ] SNS topics for alert notifications
- [ ] Application Performance Monitoring (APM) tool configured (optional: Sentry, New Relic)

### 7. Performance Optimization ✅
- [ ] Response compression enabled
- [ ] Database connection pooling configured
- [ ] Database indexes verified
- [ ] Image optimization configured (Next.js)
- [ ] Static asset caching configured
- [ ] CDN setup for frontend assets (optional: CloudFront)
- [ ] Auto-scaling policies configured
  - [ ] CPU-based scaling (target 70%)
  - [ ] Min tasks: 2, Max tasks: 10

### 8. Backup & Disaster Recovery ✅
- [ ] RDS automated backups enabled
- [ ] Manual RDS snapshot taken before deployment
- [ ] Backup retention period set (7-30 days)
- [ ] Disaster recovery plan documented
- [ ] Database restore procedure tested
- [ ] Application rollback procedure documented

### 9. DNS & Domain Configuration ✅
- [ ] Domain name registered
- [ ] Route 53 hosted zone created
- [ ] A/AAAA records pointing to ALB
- [ ] SSL certificate validated for domain
- [ ] www subdomain configured (if needed)
- [ ] api subdomain configured
- [ ] Email verification domain configured (SPF, DKIM, DMARC records)

### 10. Testing Before Go-Live 🔄
- [ ] Smoke tests passed
- [ ] Authentication flow tested
- [ ] API endpoints tested
- [ ] Real-time messaging tested
- [ ] File upload tested (Cloudinary)
- [ ] Email notifications tested
- [ ] Mobile responsiveness verified
- [ ] Load testing performed (recommended tool: Apache JMeter, k6)
- [ ] Security scan completed (recommended: OWASP ZAP)
- [ ] SSL certificate chain validated

## Deployment Steps

### Step 1: Build and Push Images
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t dating-backend .
docker tag dating-backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-backend:v1.0.0
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-backend:v1.0.0

# Build and push frontend
cd ../frontend
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com -t dating-frontend .
docker tag dating-frontend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-frontend:v1.0.0
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-frontend:v1.0.0
```

### Step 2: Run Database Migrations
```bash
# Run migration task in ECS
aws ecs run-task \
    --cluster dating-cluster \
    --task-definition dating-backend \
    --launch-type FARGATE \
    --overrides '{"containerOverrides":[{"name":"backend","command":["npx","prisma","migrate","deploy"]}]}'
```

### Step 3: Deploy Services
```bash
# Update backend service
aws ecs update-service \
    --cluster dating-cluster \
    --service dating-backend \
    --force-new-deployment

# Update frontend service
aws ecs update-service \
    --cluster dating-cluster \
    --service dating-frontend \
    --force-new-deployment
```

### Step 4: Verify Deployment
- [ ] Check ECS service status
- [ ] Check ALB target health
- [ ] Check CloudWatch logs for errors
- [ ] Test health check endpoints
- [ ] Test user authentication
- [ ] Test real-time messaging
- [ ] Monitor error rates

## Post-Deployment

### 1. Immediate Monitoring (First 24 Hours) 🔄
- [ ] Monitor CloudWatch logs for errors
- [ ] Check error rates and response times
- [ ] Verify all ECS tasks are running
- [ ] Monitor database connections
- [ ] Check memory and CPU utilization
- [ ] Verify auto-scaling triggers correctly
- [ ] Monitor ALB request count

### 2. User Communication 📢
- [ ] Announce deployment to users
- [ ] Monitor support channels for issues
- [ ] Prepare incident response team
- [ ] Document any known issues

### 3. Performance Baseline 📊
- [ ] Record baseline metrics (response times, throughput)
- [ ] Monitor user traffic patterns
- [ ] Identify bottlenecks
- [ ] Plan optimization priorities

### 4. Documentation Updates 📝
- [ ] Update deployment documentation
- [ ] Document configuration changes
- [ ] Update runbooks for common issues
- [ ] Create incident response procedures

## Rollback Plan

### If Critical Issues Occur:
1. **Immediate Rollback:**
   ```bash
   aws ecs update-service \
       --cluster dating-cluster \
       --service dating-backend \
       --task-definition dating-backend:PREVIOUS_VERSION
   ```

2. **Database Rollback:**
   ```bash
   aws rds restore-db-instance-from-db-snapshot \
       --db-instance-identifier dating-postgres-restored \
       --db-snapshot-identifier <SNAPSHOT_ID>
   ```

3. **Communication:**
   - Notify users of issue
   - Provide ETA for resolution
   - Post status updates

## Maintenance Schedule

### Daily:
- Review CloudWatch logs
- Check error rates
- Monitor database performance

### Weekly:
- Review security alerts
- Check backup success
- Update dependencies (security patches)
- Review cost reports

### Monthly:
- Security audit
- Performance review
- Capacity planning review
- Cost optimization review
- Database maintenance (VACUUM, ANALYZE)

## Emergency Contacts

- **DevOps Lead:** [Name] - [Phone] - [Email]
- **Backend Lead:** [Name] - [Phone] - [Email]
- **Frontend Lead:** [Name] - [Phone] - [Email]
- **AWS Support:** 1-866-766-5064
- **On-Call Engineer:** [Phone] - [Slack Channel]

## Useful Commands

### View Service Status
```bash
aws ecs describe-services --cluster dating-cluster --services dating-backend dating-frontend
```

### View Task Logs
```bash
aws logs tail /ecs/dating-backend --follow
```

### Scale Service
```bash
aws ecs update-service --cluster dating-cluster --service dating-backend --desired-count 4
```

### Check Database Connections
```bash
aws rds describe-db-instances --db-instance-identifier dating-postgres
```

## Success Criteria

Deployment is considered successful when:
- ✅ All ECS tasks are running and healthy
- ✅ ALB health checks passing (100% healthy targets)
- ✅ No 5xx errors in CloudWatch logs
- ✅ Response time < 500ms (p95)
- ✅ Authentication working correctly
- ✅ Real-time messaging functional
- ✅ File uploads working
- ✅ Email notifications sending
- ✅ Database migrations completed
- ✅ Zero critical errors in first hour

## Notes

- Take database snapshot before any major changes
- Test rollback procedure in staging first
- Keep previous task definitions for quick rollback
- Document all configuration changes
- Monitor costs closely in first month
- Plan for gradual traffic increase

**Deployment Date:** __________  
**Deployed By:** __________  
**Version:** __________  
**Sign-off:** __________
