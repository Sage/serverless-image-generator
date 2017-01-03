# serverless-image-generator

This project generates images (SVGs) through AWS Lambda and API Gateway. It is a cost effective solution for numerous use cases, and in our case, generating static availability stats.

## <a name="quick-start"></a>Quick Start

serverless-image-generator is based on the fantastic [serverless.com](http://www.serverless.com) framework. Everything you need is in that project. To deploy, follow these steps:

1. **Install serverless via npm:**
  ```bash
  npm install -g serverless
  ```

2. **Configure serverless as per documentation at [serverless.com](http://www.serverless.com)**

3. **Clone repo**
  ```bash
  git clone https://github.com/Sage/serverless-image-generator
  ```

4. **Download node dependencies**
  ```bash
  npm install
  ```

5. **Deploy service to dev stage**
  ```bash
  serverless deploy
  ```

6. **Deploy to production stage**
  ```bash
  serverless deploy -s production
  ```
