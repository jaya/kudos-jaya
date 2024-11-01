import logger from '../logger';

const logMessage = 'Test log message';
const logObject = {
  error: 'Test error',
  data: {
    a: 'a',
    b: 'b',
  },
};

describe('Logger', () => {
  let loggerSpy: jest.SpyInstance;

  describe('info', () => {
    beforeEach(() => {
      loggerSpy = jest.spyOn(logger, 'info');
    });
    describe('Only message', () => {
      it('should log as info', () => {
        logger.info(logMessage);

        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(logMessage);
      });
    });

    describe('With message and log object', () => {
      it('should log as info', () => {
        logger.info(logMessage, logObject);

        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(logMessage, logObject);
      });
    });
  });

  describe('warn', () => {
    beforeEach(() => {
      loggerSpy = jest.spyOn(logger, 'warn');
    });
    describe('Only message', () => {
      it('should log as warn', () => {
        logger.warn(logMessage);

        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(logMessage);
      });
    });

    describe('With message and log object', () => {
      it('should log as warn', () => {
        logger.warn(logMessage, logObject);

        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(logMessage, logObject);
      });
    });
  });

  describe('error', () => {
    beforeEach(() => {
      loggerSpy = jest.spyOn(logger, 'error');
    });
    describe('Only message', () => {
      it('should log as error', () => {
        logger.error(logMessage);

        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(logMessage);
      });
    });

    describe('With message and log object', () => {
      it('should log as error', () => {
        logger.error(logMessage, logObject);

        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(logMessage, logObject);
      });
    });
  });

  describe('debug', () => {
    beforeEach(() => {
      loggerSpy = jest.spyOn(logger, 'debug');
    });
    describe('Only message', () => {
      it('should log as debug', () => {
        logger.debug(logMessage);

        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(logMessage);
      });
    });

    describe('With message and log object', () => {
      it('should log as debug', () => {
        logger.debug(logMessage, logObject);

        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(logMessage, logObject);
      });
    });
  });
});
