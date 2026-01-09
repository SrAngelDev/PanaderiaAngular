import { Producto } from './producto.interface';

export interface ItemTicket {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}
