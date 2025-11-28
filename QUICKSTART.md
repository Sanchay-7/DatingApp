# Quick Start Guide - Production Deployment

## Prerequisites Installed?
- [x] AWS CLI configured
- [x] Docker & Docker Compose
- [x] Node.js 18+ and npm

## 🚀 Quick Deploy (15 minutes)

### 1. Clone and Setup (2 minutes)
```bash
git clone <your-repo>
cd "Dating web app/v2"
```

### 2. Configure Environment (3 minutes)
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your actual values

# Frontend  
cd ../frontend
cp .env.production.example .env.production
# Edit .env.production with your values
```

**Required values:**
- `DATABASE_URL`: Your RDS PostgreSQL connection string
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `ALLOWED_ORIGINS`: Your frontend domain
- All Firebase, Cloudinary, Ably credentials

### 3. Test Locally (5 minutes)
```bash
# From project root
docker-compose up --build

# Test endpoints:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/health
# Database: localhost:5432
```

### 4. Deploy to AWS (5 minutes)

#### Push to ECR:
```bash
# Login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Push images (automated if using GitHub Actions)
docker-compose build
docker tag v2_backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-backend:latest
docker tag v2_frontend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-frontend:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-frontend:latest
```

#### Update ECS Services:
```bash
aws ecs update-service --cluster dating-cluster --service dating-backend --force-new-deployment
aws ecs update-service --cluster dating-cluster --service dating-frontend --force-new-deployment
```

## ✅ Verification Checklist

After deployment, verify:

```bash
# 1. Services running
aws ecs describe-services --cluster dating-cluster --services dating-backend dating-frontend

# 2. Health checks passing
curl https://api.yourdomain.com/health
curl https://yourdomain.com

# 3. Logs clean
aws logs tail /ecs/dating-backend --follow --since 5m

# 4. Database connected
# Check backend logs for "Database connected successfully"
```

## 🐛 Troubleshooting

### Services won't start?
```bash
# Check task logs
aws logs tail /ecs/dating-backend --follow

# Common issues:
# - Missing environment variables → Check Secrets Manager
# - Database connection → Verify RDS security group
# - Image pull errors → Verify ECR permissions
```

### Database migration issues?
```bash
# Run migrations manually
aws ecs run-task \
    --cluster dating-cluster \
    --task-definition dating-backend \
    --launch-type FARGATE \
    --overrides '{"containerOverrides":[{"name":"backend","command":["npx","prisma","migrate","deploy"]}]}'
```

### Can't connect to RDS?
```bash
# Test from bastion host or ECS task
psql "postgresql://admin:<PASSWORD>@<RDS_ENDPOINT>:5432/dating"
```

## 📞 Need Help?

1. **Check logs first:** `aws logs tail /ecs/dating-backend --follow`
2. **Review checklist:** See `PRODUCTION_CHECKLIST.md`
3. **Full guide:** See `AWS_DEPLOYMENT_GUIDE.md`
4. **GitHub Actions:** Push to `main` branch for auto-deploy

## 🔄 Update Application

### Code changes:
```bash
git push origin main
# GitHub Actions will auto-deploy (if configured)
```

### Manual deploy:
```bash
# Build and push new images
docker-compose build
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dating-backend:latest

# Update service
aws ecs update-service --cluster dating-cluster --service dating-backend --force-new-deployment
```

### Rollback:
```bash
aws ecs update-service \
    --cluster dating-cluster \
    --service dating-backend \
    --task-definition dating-backend:PREVIOUS_VERSION
```

## 💰 Cost Estimate

**Minimum production setup (~$130-180/month):**
- ECS Fargate (4 tasks): $80-100
- RDS db.t3.micro: $15-20  
- ALB: $20-25
- Data transfer: $10-20
- CloudWatch: $5-10

**Scaling up (medium traffic ~$300-500/month):**
- ECS Fargate (8-10 tasks): $160-250
- RDS db.t3.small: $30-40
- ALB + data: $40-60
- CloudWatch + monitoring: $20-30

## 🔐 Security Notes

**NEVER commit to git:**
- `.env` files
- AWS credentials
- SSL certificates
- Database passwords
- API keys

**Always encrypted:**
- Database (RDS encryption at rest)
- Connections (HTTPS/TLS 1.2+)
- Secrets (AWS Secrets Manager)
- Backups (encrypted snapshots)

## 📊 Monitor Your App

**CloudWatch Dashboard:**
- CPU/Memory utilization
- Request count & latency
- Error rates (4xx, 5xx)
- Database connections

**Set up alerts for:**
- High CPU (>80%)
- High error rate (>5%)
- Failed health checks
- Database connection issues

**View logs:**
```bash
# Real-time logs
aws logs tail /ecs/dating-backend --follow

# Search for errors
aws logs filter-pattern /ecs/dating-backend --filter-pattern "ERROR"
```

## 🎯 Next Steps

1. ✅ **Immediate:** Verify all services healthy
2. ✅ **Day 1:** Monitor logs, set up alerts
3. ✅ **Week 1:** Performance tuning, cost optimization
4. ⬜ **Month 1:** Security audit, load testing
5. ⬜ **Ongoing:** Regular updates, backups verification

---

**Ready to deploy?** Start with local testing, then follow AWS deployment guide!
