import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
    Logger,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { GqlExecutionContext } from '@nestjs/graphql';
  import { JwtService } from '@nestjs/jwt';
  
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);
  
    constructor(private readonly jwtService: JwtService) {
      super();
    }
  
    getRequest(context: ExecutionContext) {
      const ctx = GqlExecutionContext.create(context);
      const request = ctx.getContext().req;
      if (!request) {
        throw new UnauthorizedException('Invalid request context');
      }
      return request;
    }
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        // Try built-in Passport authentication first
        const result = await super.canActivate(context);
        if (result) {
          const request = this.getRequest(context);
          this.logger.debug(`Authentication successful for user: ${request.user?.id}`);
          return true;
        }
      } catch (error) {
        this.logger.warn('Passport authentication failed, falling back to JWT verification');
      }
  
      // Fall back to manual JWT verification
      const request = this.getRequest(context);
      const token = this.extractTokenFromHeader(request);
  
      if (!token) {
        throw new UnauthorizedException('No authorization token provided');
      }
  
      try {
        if (!this.jwtService) {
          this.logger.error('JWT Service not properly initialized');
          throw new UnauthorizedException('Authentication service is unavailable');
        }
  
        const payload = await this.jwtService.verifyAsync(token);
        request.user = payload;
        this.logger.debug(`JWT verification successful for user: ${payload.sub}`);
        return true;
      } catch (error) {
        this.logger.error(`Token verification failed: ${error.message}`);
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  
    private extractTokenFromHeader(request: any): string | null {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return null;
      }
  
      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('Invalid authorization token format');
      }
  
      return token;
    }
  }
  