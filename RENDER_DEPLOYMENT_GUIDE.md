# Render Deployment Guide - Secure Environment Variables

## Overview

This guide shows you how to deploy your e-commerce backend services to Render while keeping your secrets secure using environment variables instead of hardcoding them in the `render.yaml` file.

## Updated render.yaml Configuration

The `render.yaml` file now uses `sync: false` for sensitive environment variables, which means you'll need to set these manually in the Render dashboard after deployment.

## Step-by-Step Deployment Process

### Step 1: Prepare Your Repository

1. **Commit the updated files**:
   ```bash
   git add .
   git commit -m "Update render.yaml for secure environment variables"
   git push origin main
   ```

### Step 2: Deploy Using Blueprint

1. **Go to Render Dashboard**:

   - Visit [render.com](https://render.com)
   - Click "New +" → "Blueprint"

2. **Connect Repository**:

   - Connect your GitHub repository
   - Select your repository
   - Render will detect the `render.yaml` file

3. **Deploy Services**:
   - Click "Apply" to deploy all services
   - This will create all services but they won't work yet due to missing environment variables

### Step 3: Configure Environment Variables

After deployment, you need to set environment variables for each service in the Render dashboard:

#### For API Gateway Service:

1. Go to your `eshop-api-gateway` service
2. Click "Environment" tab
3. Add these variables:
   ```
   AUTH_SERVICE_URL = https://eshop-auth-service.onrender.com
   PRODUCT_SERVICE_URL = https://eshop-product-service.onrender.com
   ORDER_SERVICE_URL = https://eshop-order-service.onrender.com
   CHAT_SERVICE_URL = https://eshop-chat-service.onrender.com
   CORS_ORIGINS = https://your-frontend-domain.com,https://your-seller-ui-domain.com
   ```

#### For Auth Service:

1. Go to your `eshop-auth-service` service
2. Click "Environment" tab
3. Add these variables:
   ```
   CORS_ORIGINS = https://your-frontend-domain.com,https://your-seller-ui-domain.com
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASS = your-gmail-app-password
   ```

#### For Product Service:

1. Go to your `eshop-product-service` service
2. Click "Environment" tab
3. Add these variables:
   ```
   CORS_ORIGINS = https://your-frontend-domain.com,https://your-seller-ui-domain.com
   ```

#### For Order Service:

1. Go to your `eshop-order-service` service
2. Click "Environment" tab
3. Add these variables:
   ```
   STRIPE_SECRET_KEY = sk_test_your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET = whsec_your_stripe_webhook_secret_here
   CORS_ORIGINS = https://your-frontend-domain.com,https://your-seller-ui-domain.com
   ```

#### For Chat Service:

1. Go to your `eshop-chat-service` service
2. Click "Environment" tab
3. Add these variables:
   ```
   KAFKA_BROKER_URL = your-kafka-broker-url-here
   CORS_ORIGINS = https://your-frontend-domain.com,https://your-seller-ui-domain.com
   ```

#### For Kafka Service:

1. Go to your `eshop-kafka-service` service
2. Click "Environment" tab
3. Add these variables:
   ```
   KAFKA_BROKER_URL = your-kafka-broker-url-here
   ```

### Step 4: Mark Sensitive Variables as Secrets

For each service, mark sensitive variables as "Secret" in Render:

1. **In the Environment tab**, click the "Secret" toggle for:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `EMAIL_PASS`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `KAFKA_BROKER_URL`

### Step 5: Update Service URLs

After all services are deployed, update the service URLs in your API Gateway:

1. **Get the actual URLs** from each service in Render dashboard
2. **Update the API Gateway environment variables** with the correct URLs
3. **Redeploy the API Gateway** if needed

### Step 6: Test Your Deployment

1. **Test each service individually**:

   ```bash
   # Test API Gateway
   curl https://your-api-gateway-url.onrender.com/gateway-health

   # Test Auth Service
   curl https://your-auth-service-url.onrender.com/

   # Test other services similarly
   ```

2. **Test service communication**:
   - Make sure API Gateway can communicate with other services
   - Test authentication flow
   - Test product listing
   - Test order creation

## Security Best Practices

### 1. Environment Variables Security

- ✅ **DO**: Use `sync: false` in render.yaml for sensitive variables
- ✅ **DO**: Set variables manually in Render dashboard
- ✅ **DO**: Mark sensitive variables as "Secret" in Render
- ❌ **DON'T**: Hardcode secrets in render.yaml
- ❌ **DON'T**: Commit .env files to version control

### 2. Database Security

- Use MongoDB Atlas with proper IP whitelisting
- Create dedicated database users with minimal permissions
- Use connection strings with proper authentication

### 3. API Security

- Use HTTPS for all service communication
- Implement proper CORS policies
- Use JWT tokens for authentication
- Implement rate limiting

### 4. External Service Security

- Use environment variables for all API keys
- Rotate keys regularly
- Use test keys for development, live keys for production

## Troubleshooting

### Common Issues:

1. **Services not starting**:

   - Check environment variables are set correctly
   - Verify all required variables are present
   - Check service logs in Render dashboard

2. **Service communication failures**:

   - Verify service URLs are correct
   - Check CORS configuration
   - Ensure all services are running

3. **Database connection issues**:

   - Verify MongoDB Atlas IP whitelist includes Render IPs
   - Check connection string format
   - Verify database user permissions

4. **Environment variable issues**:
   - Double-check variable names match your code
   - Verify no typos in values
   - Ensure sensitive variables are marked as secrets

## Alternative: Using Render CLI

You can also use Render CLI to manage environment variables:

```bash
# Install Render CLI
npm install -g @render/cli

# Login to Render
render login

# Set environment variables
render env set AUTH_SERVICE_URL https://eshop-auth-service.onrender.com --service eshop-api-gateway
render env set STRIPE_SECRET_KEY sk_test_your_key --service eshop-order-service --secret
```

## Cost Optimization

- Start with free tier for testing
- Monitor usage and upgrade to paid plans as needed
- Use auto-sleep for development environments
- Optimize build times to reduce costs

## Monitoring and Maintenance

1. **Set up alerts** for service failures
2. **Monitor logs** regularly
3. **Update dependencies** periodically
4. **Backup database** regularly
5. **Test deployments** in staging environment first

This approach ensures your secrets are never exposed in your codebase while maintaining a smooth deployment process.
