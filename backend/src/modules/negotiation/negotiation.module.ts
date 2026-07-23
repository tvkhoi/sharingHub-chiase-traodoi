import { Module } from '@nestjs/common';
import { NegotiationService } from './negotiation.service';
import { NegotiationController } from './negotiation.controller';
import { NegotiationGateway } from './negotiation.gateway';

@Module({
  controllers: [NegotiationController],
  providers: [NegotiationService, NegotiationGateway],
  exports: [NegotiationService, NegotiationGateway],
})
export class NegotiationModule {}
