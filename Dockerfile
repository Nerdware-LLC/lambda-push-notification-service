# syntax=docker/dockerfile:1
######################################################################
### IMAGE: nerdware/lambda-push-notification-service
######################################################################
# base

# This build stage sets values and files common to all build stages
# Source image repo: https://gallery.ecr.aws/lambda/nodejs
FROM public.ecr.aws/lambda/nodejs:16 as base

# Expose desired port
EXPOSE 8080

# Explicitly set workdir
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy over only the files necessary to run the Lambda function
COPY package*.json function ${LAMBDA_TASK_ROOT}/

# TODO rm this after testing file/dir placement within target (testing above COPY)
RUN echo ./*

#---------------------------------------------------------------------
# builder

# This build stage creates the build/ artifact for "prod" build stage
FROM base as builder

# Copy over the tsconfigs
COPY tsconfig*.json ./

# Copy over src files
COPY src src/

# Install all dependencies
RUN npm ci

# Create function/ for "prod" stage
RUN npm run build

#---------------------------------------------------------------------
# prod

# This build stage is what ultimately gets saved as the prod Lambda fn
FROM base as prod

# Copy over only the files needed in production
COPY --from=builder function ./function/

# Install only the necessary dependencies
RUN npm ci --omit=dev

# TODO do we need USER here? What to use for Lambda?

# The Lambda handler function must be the CMD instruction
CMD [ "index.handler" ]

######################################################################
