import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from './models/producto.interface';
import { ItemTicket } from './models/item-ticket.interface';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('PanaderiaAngular');

  // Lista de productos disponibles
  protected readonly productos: Producto[] = [
    { nombre: 'Chapata', precio: 0.65 },
    { nombre: 'Baguette', precio: 0.55 },
    { nombre: 'Pistola', precio: 0.45 },
    { nombre: 'Pan de Molde', precio: 1.20 },
    { nombre: 'Croissant', precio: 0.80 }
  ];

  // Producto seleccionado en el desplegable
  protected productoSeleccionado = signal<Producto>(this.productos[0]);

  // Cantidad a añadir
  protected cantidad = signal<number>(1);

  // Items del ticket
  protected itemsTicket = signal<ItemTicket[]>([]);

  /**
   * Calcula el total de la línea actual (precio * cantidad)
   */
  protected get totalLinea(): number {
    return this.productoSeleccionado().precio * this.cantidad();
  }

  /**
   * Calcula el total del ticket
   */
  protected get totalFinal(): number {
    return this.itemsTicket().reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Maneja el cambio de producto en el select
   */
  protected onProductoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const index = parseInt(select.value);
    this.productoSeleccionado.set(this.productos[index]);
  }

  /**
   * Añade el producto seleccionado al ticket
   * Si el producto ya existe, incrementa su cantidad
   */
  protected anadirProducto(): void {
    const producto = this.productoSeleccionado();
    const cant = this.cantidad();

    if (!producto || !cant || cant < 1) {
      alert("Por favor, selecciona un producto y una cantidad válida.");
      return;
    }

    // Buscar si el producto ya existe en el ticket
    const itemExistente = this.itemsTicket().find(
      item => item.producto.nombre === producto.nombre
    );

    if (itemExistente) {
      // Si existe, actualizamos la cantidad
      const nuevosItems = this.itemsTicket().map(item => {
        if (item.producto.nombre === producto.nombre) {
          const nuevaCantidad = item.cantidad + cant;
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: producto.precio * nuevaCantidad
          };
        }
        return item;
      });
      this.itemsTicket.set(nuevosItems);
    } else {
      // Si no existe, lo añadimos
      const nuevoItem: ItemTicket = {
        producto: producto,
        cantidad: cant,
        subtotal: producto.precio * cant
      };
      this.itemsTicket.set([...this.itemsTicket(), nuevoItem]);
    }

    // Resetear la cantidad a 1
    this.cantidad.set(1);
  }

  /**
   * Elimina un item del ticket
   */
  protected borrarItem(index: number): void {
    const nuevosItems = this.itemsTicket().filter((_, i) => i !== index);
    this.itemsTicket.set(nuevosItems);
  }

  /**
   * Genera un ticket de compra en formato texto
   */
  protected imprimirTicket(): void {
    if (this.itemsTicket().length === 0) {
      alert("El ticket está vacío.");
      return;
    }

    let ticket = "****** TICKET DE COMPRA ******\n";
    ticket += "Panaderia Sánchez S.A\n";
    ticket += "--------------------------------\n\n";
    ticket += "Producto\tCant.\tSubtotal\n";
    ticket += "--------------------------------\n";

    this.itemsTicket().forEach(item => {
      ticket += `${item.producto.nombre}\t${item.cantidad}\t${item.subtotal.toFixed(2)} €\n`;
    });

    ticket += "\n--------------------------------\n";
    ticket += `TOTAL: ${this.totalFinal.toFixed(2)} €\n`;
    ticket += "--------------------------------\n";
    ticket += "¡Gracias por su compra!\n";

    alert(ticket);
  }
}
