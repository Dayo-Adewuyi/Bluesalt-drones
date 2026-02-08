import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blusalt Drone Dispatch Controller API',
      version: '1.0.0',
      description: 'API for drone registration, medication loading, and battery audits.',
    },
    servers: [{ url: '/api/v1' }],
    components: {
      schemas: {
        Drone: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            serialNumber: { type: 'string' },
            model: { type: 'string' },
            weightLimit: { type: 'number' },
            batteryCapacity: { type: 'integer' },
            state: { type: 'string' },
          },
        },
        Medication: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            weight: { type: 'number' },
            code: { type: 'string' },
            image: { type: 'string', nullable: true },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  example: { status: 'ok' },
                },
              },
            },
          },
        },
      },
      '/drones': {
        post: {
          summary: 'Register drone',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  serialNumber: 'DRN-LW-010',
                  model: 'Lightweight',
                  weightLimit: 200,
                  batteryCapacity: 90,
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'drone registered',
                    data: {
                      id: 11,
                      serialNumber: 'DRN-LW-010',
                      model: 'Lightweight',
                      weightLimit: 200,
                      batteryCapacity: 90,
                      state: 'IDLE',
                    },
                  },
                },
              },
            },
            '422': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    error: { code: 'VALIDATION_ERROR' },
                  },
                },
              },
            },
            '409': {
              description: 'Conflict',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Serial number already exists',
                    error: { code: 'SERIAL_NUMBER_EXISTS' },
                  },
                },
              },
            },
          },
        },
      },
      '/drones/available': {
        get: {
          summary: 'Available drones',
          parameters: [
            { name: 'model', in: 'query', required: false, example: 'Lightweight' },
            { name: 'minBattery', in: 'query', required: false, example: 50 },
            { name: 'search', in: 'query', required: false, example: 'DRN-LW' },
            { name: 'limit', in: 'query', required: false, example: 10 },
            { name: 'offset', in: 'query', required: false, example: 0 },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'success',
                    data: {
                      items: [
                        {
                          id: 1,
                          serialNumber: 'DRN-LW-001',
                          model: 'Lightweight',
                          weightLimit: 150,
                          batteryCapacity: 100,
                          state: 'IDLE',
                        },
                      ],
                      meta: { total: 1, limit: 10, offset: 0, currentPage: 1 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/drones/{droneId}/load': {
        post: {
          summary: 'Load medications',
          parameters: [{ name: 'droneId', in: 'path', required: true }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  medicationIds: [1, 2, 3],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'drone loaded',
                    data: {
                      id: 1,
                      state: 'LOADED',
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'drone with id 99 not found',
                    error: { code: 'DRONE_NOT_FOUND' },
                  },
                },
              },
            },
            '422': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Weight limit exceeded',
                    error: { code: 'VALIDATION_ERROR' },
                  },
                },
              },
            },
          },
        },
      },
      '/drones/{droneId}/medications': {
        get: {
          summary: 'Loaded medications',
          parameters: [{ name: 'droneId', in: 'path', required: true }],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'success',
                    data: [
                      { id: 1, name: 'Aspirin-100mg', weight: 50, code: 'ASP_100', image: null },
                    ],
                  },
                },
              },
            },
            '404': {
              description: 'Not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'drone with id 99 not found',
                    error: { code: 'DRONE_NOT_FOUND' },
                  },
                },
              },
            },
          },
        },
      },
      '/drones/{droneId}/battery': {
        get: {
          summary: 'Battery level',
          parameters: [{ name: 'droneId', in: 'path', required: true }],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'success',
                    data: {
                      serialNumber: 'DRN-LW-001',
                      batteryCapacity: 85,
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'drone with id 99 not found',
                    error: { code: 'DRONE_NOT_FOUND' },
                  },
                },
              },
            },
          },
        },
      },
      '/medications': {
        post: {
          summary: 'Create medication',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'weight', 'code'],
                  properties: {
                    name: { type: 'string', example: 'Ibuprofen-200mg', description: 'Only letters, numbers, - and _ allowed' },
                    weight: { type: 'number', example: 75, description: 'Medication weight in grams' },
                    code: { type: 'string', example: 'IBU_200', description: 'Only uppercase letters, numbers and _ allowed' },
                    image: { type: 'string', format: 'uri', example: 'https://example.com/images/ibuprofen.png', description: 'URL to the medication image (optional)' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'medication created',
                    data: {
                      id: 1,
                      name: 'Ibuprofen-200mg',
                      weight: 75,
                      code: 'IBU_200',
                      image: null,
                    },
                  },
                },
              },
            },
            '409': {
              description: 'Conflict',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Medication code already exists',
                    error: { code: 'MEDICATION_CODE_EXISTS' },
                  },
                },
              },
            },
            '422': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    error: { code: 'VALIDATION_ERROR' },
                  },
                },
              },
            },
          },
        },
        get: {
          summary: 'List medications',
          parameters: [
            { name: 'search', in: 'query', required: false, example: 'Ibu' },
            { name: 'name', in: 'query', required: false, example: 'Ibuprofen' },
            { name: 'code', in: 'query', required: false, example: 'IBU_200' },
            { name: 'minWeight', in: 'query', required: false, example: 50 },
            { name: 'maxWeight', in: 'query', required: false, example: 200 },
            { name: 'limit', in: 'query', required: false, example: 10 },
            { name: 'offset', in: 'query', required: false, example: 0 },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'success',
                    data: {
                      items: [
                        { id: 1, name: 'Ibuprofen-200mg', weight: 75, code: 'IBU_200', image: null },
                      ],
                      meta: { total: 1, limit: 10, offset: 0, currentPage: 1 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/medications/{id}': {
        get: {
          summary: 'Get medication by id',
          parameters: [{ name: 'id', in: 'path', required: true }],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'success',
                    data: { id: 1, name: 'Ibuprofen-200mg', weight: 75, code: 'IBU_200', image: null },
                  },
                },
              },
            },
            '404': {
              description: 'Not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'medication with id 99 not found',
                    error: { code: 'MEDICATION_NOT_FOUND' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
});
