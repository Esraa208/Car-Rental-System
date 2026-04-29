import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Car } from '../../../core/models';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './car-card.html',
  styleUrl: './car-card.scss',
})
export class CarCard {
  car = input.required<Car>();
  view = output<Car>();
}
