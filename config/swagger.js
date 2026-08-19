import "dotenv/config";
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Read dynamic URL or fallback to defaults based on NODE_ENV
const server_url = process.env.PROD === 'true'
  ? process.env.SERVER_URL
  : process.env.SERVER_LOCAL_URL;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coursify API Documentation',
      version: '1.0.0',
      description: 'API endpoints documentation for Coursify',
    },
    tags: [
      { name: 'Users', description: 'User endpoints' },
      { name: 'Courses', description: 'Course endpoints' },
      { name: 'Lectures', description: 'Lecture endpoints' },
      { name: 'Payments', description: 'Payment endpoints' },
      { name: 'Miscellaneous', description: 'Miscellaneous endpoints' },
    ],
    servers: [
      {
        url: server_url,
        description: process.env.PROD === 'true' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
  },
  apis: ['../swagger-docs/*.yaml'],
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      withCredentials: true,
    },
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js',
    ],
  }));
};

export default setupSwagger;