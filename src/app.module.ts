import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesController } from './clientes/clientes.controller';
import { ParametrosController } from './parametros/parametros.controller';
import { DatosController } from './general/datos.controller';
import { ArticulosController } from './articulos/articulos.controller';
import { MenusController } from './menus/menus.controller';
import { TeclasController } from './teclas/teclas.controller';
import { DependientasController } from './dependientas/dependientas.controller';
import { FamiliasController } from './familias/familias.controller';
import { PromocionesController } from './promociones/promociones.controller';
import { InfoTicketController } from './info-ticket/info-ticket.controller';
import { CestasController } from './cestas/cestas.controller';
import { SocketsGateway } from './sockets.gateway';
import { TestController } from './test/test.controller';
import { TicketsController } from './tickets/tickets.controller';
import { TurnosController } from './turnos/turnos.controller';
import { UtilesModule } from './utiles/utiles.module';
import { EntregasController } from './entregas/entregas.controller';
import { ImpresorasIpController } from './impresoras-ip/impresoras-ip.controller';
import { OrdaticController } from './ordatic/ordatic.controller';
import { AppFirebaseController } from './app-firebase/app-firebase.controller';

@Module({
  imports: [UtilesModule],
  controllers: [AppController, ClientesController, ParametrosController, DatosController, ArticulosController, MenusController, TeclasController, DependientasController, FamiliasController, PromocionesController, InfoTicketController, CestasController, TestController, TicketsController, TurnosController, EntregasController, ImpresorasIpController, OrdaticController, AppFirebaseController],
  providers: [AppService, SocketsGateway],
})
export class AppModule {}
