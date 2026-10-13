
class Order {
    constructor() {
        this._items = [];
        this._status = 'draft';
    }

    get items() {
        return [...this._items];
    }

    get status() {
        return this._status;
    }

    set status(newStatus) {
        const allowed = ['draft', 'confirmed', 'cancelled'];
        if (!allowed.includes(newStatus)) {
            throw new Error(`Invalid status: ${newStatus}`);
        }
        this._status = newStatus;
    }

    addItem(item) {
        if (this._status !== 'draft') {
            throw new Error('Cannot modify order after confirmation or cancellation');
        }
        if (!item.name || typeof item.name !== 'string') {
            throw new Error('Item must have a valid name');
        }
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new Error('Price must be a non-negative number');
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error('Quantity must be a positive integer');
        }

        const existing = this._items.find(i => i.name === item.name);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            this._items.push({ ...item });
        }
    }

    removeItem(itemName) {
        if (this._status !== 'draft') {
            throw new Error('Cannot modify order after confirmation or cancellation');
        }
        const index = this._items.findIndex(i => i.name === itemName);
        if (index === -1) {
            return false;
        }
        this._items.splice(index, 1);
        return true;
    }

    getTotalPrice() {
        return this._items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    applyCoupon(coupon) {
        if (this._items.length === 0) {
            return 0;
        }
        const total = this.getTotalPrice();
        if (coupon.type === 'percent') {
            const discount = total * (coupon.value / 100);
            return Math.max(0, total - discount);
        } else if (coupon.type === 'fixed') {
            return Math.max(0, total - coupon.value);
        } else {
            throw new Error('Unknown coupon type');
        }
    }

    confirm() {
        if (this._status !== 'draft') {
            throw new Error('Only draft orders can be confirmed');
        }
        if (this._items.length === 0) {
            throw new Error('Cannot confirm empty order');
        }
        this._status = 'confirmed';
    }

    cancel() {
        if (this._status === 'cancelled') {
            throw new Error('Order is already cancelled');
        }
        this._status = 'cancelled';
    }
}

module.exports = Order;