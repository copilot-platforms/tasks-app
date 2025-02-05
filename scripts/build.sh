# Short-circuit old build command for production for now, since trigger is not set up in `main`
# Remove this code once `tdb1` branch is promoted to production
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then
  echo "Running old build script"
  next build && npx prisma migrate deploy && yarn db:grant-supabase-privileges
  exit 0
fi

echo "👷 Running build script for environment: $VERCEL_ENV"
# Real script starts here:

# Build and deploy latest trigger jobs to trigger cloud
if [ "$VERCEL_ENV" = "production" ]; then
  echo "🚀 Deploying trigger jobs for production environment..."
  yarn trigger:deploy-prod
elif [ "$VERCEL_ENV" = "production" ]; then
  echo "🚀 Deploying trigger jobs for staging environment..."
  yarn trigger:deploy-staging
else
  echo "🔒 Skip deploying trigger jobs for dev environment"
fi

# Build the latest code for branch
echo "🛠️ Building Next app"
next build

# Migrate latest changes in prisma schema
echo "🔧 Applying latest prisma migrations"
yarn prisma migrate deploy

# Grant anon privileges so realtime channel can work using only Copilot token
echo "🏃 Running grant-supabase-privileges"
yarn db:grant-supabase-privileges

echo "🥳 Deployment completed! 🎉🎉🎉"
