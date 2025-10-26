import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ar-AE', {
    style: 'currency',
    currency: 'AED',
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

export function generatePickupTimeSlots(): Date[] {
  const slots: Date[] = [];
  const now = new Date();
  const startTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
  
  // Round to next 15-minute interval
  const minutes = startTime.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  startTime.setMinutes(roundedMinutes);
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);
  
  // Generate slots for next 4 hours
  for (let i = 0; i < 16; i++) {
    const slot = new Date(startTime.getTime() + i * 15 * 60 * 1000);
    slots.push(slot);
  }
  
  return slots;
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'received':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'preparing':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'ready':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}

export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case 'received':
      return 'Order Received';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready for Pickup';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'breakfast':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'lunch':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'snacks':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'beverages':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}
