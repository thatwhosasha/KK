
const Order = require('./order');

describe('Order class', () => {
    let order;

    beforeEach(() => {
        order = new Order();
    });

    //  Тесты на мутацию свойств (добавление/удаление)
    describe('addItem()', () => {
        test('добавляет новый товар в пустой заказ', () => {
            order.addItem({ name: 'Laptop', price: 1000, quantity: 1 });
            expect(order.items).toHaveLength(1);
            expect(order.items[0]).toEqual({ name: 'Laptop', price: 1000, quantity: 1 });
        });

        test('увеличивает количество, если товар с таким именем уже есть', () => {
            order.addItem({ name: 'Mouse', price: 50, quantity: 2 });
            order.addItem({ name: 'Mouse', price: 50, quantity: 3 });
            expect(order.items).toHaveLength(1);
            expect(order.items[0].quantity).toBe(5);
        });

        test('выбрасывает ошибку, если заказ не в draft', () => {
            order.addItem({ name: 'Key', price: 10, quantity: 1 });
            order.confirm();
            expect(() => order.addItem({ name: 'Mouse', price: 20, quantity: 1 }))
                .toThrow('Cannot modify order after confirmation');
        });

        test('выбрасывает ошибку при невалидном имени', () => {
            expect(() => order.addItem({ name: '', price: 10, quantity: 1 }))
                .toThrow('Item must have a valid name');
            expect(() => order.addItem({ name: 123, price: 10, quantity: 1 }))
                .toThrow('Item must have a valid name');
        });

        test('выбрасывает ошибку при отрицательной цене', () => {
            expect(() => order.addItem({ name: 'A', price: -5, quantity: 1 }))
                .toThrow('Price must be a non-negative number');
        });

        test('выбрасывает ошибку при нецелом или не положительном количестве', () => {
            expect(() => order.addItem({ name: 'A', price: 10, quantity: 0 }))
                .toThrow('Quantity must be a positive integer');
            expect(() => order.addItem({ name: 'A', price: 10, quantity: 2.5 }))
                .toThrow('Quantity must be a positive integer');
        });
    });

    describe('removeItem()', () => {
        test('удаляет существующий товар и возвращает true', () => {
            order.addItem({ name: 'Pen', price: 2, quantity: 10 });
            const result = order.removeItem('Pen');
            expect(result).toBe(true);
            expect(order.items).toHaveLength(0);
        });

        test('возвращает false, если товар не найден', () => {
            order.addItem({ name: 'Pen', price: 2, quantity: 10 });
            const result = order.removeItem('Notebook');
            expect(result).toBe(false);
            expect(order.items).toHaveLength(1);
        });

        test('выбрасывает ошибку, если заказ не draft', () => {
            order.addItem({ name: 'Pen', price: 2, quantity: 1 });
            order.confirm();
            expect(() => order.removeItem('Pen'))
                .toThrow('Cannot modify order after confirmation');
        });
    });

    // Статус
    describe('status setter/getter', () => {
        test('изменяет статус на допустимый', () => {
            order.status = 'cancelled';
            expect(order.status).toBe('cancelled');
        });

        test('выбрасывает ошибку при недопустимом статусе', () => {
            expect(() => { order.status = 'shipped'; })
                .toThrow('Invalid status: shipped');
        });
    });

    // Расчёт стоимости
    describe('getTotalPrice()', () => {
        test('возвращает 0 для пустого заказа', () => {
            expect(order.getTotalPrice()).toBe(0);
        });

        test('правильно суммирует стоимость всех товаров', () => {
            order.addItem({ name: 'A', price: 100, quantity: 2 });
            order.addItem({ name: 'B', price: 50, quantity: 3 });
            expect(order.getTotalPrice()).toBe(100*2 + 50*3);
        });
    });

    describe('applyCoupon()', () => {
        test('процентная скидка корректно вычитается', () => {
            order.addItem({ name: 'A', price: 200, quantity: 1 }); 
            const result = order.applyCoupon({ type: 'percent', value: 10 });
            expect(result).toBe(180);
        });

        test('фиксированная скидка не делает цену отрицательной', () => {
            order.addItem({ name: 'A', price: 50, quantity: 1 });
            const result = order.applyCoupon({ type: 'fixed', value: 100 });
            expect(result).toBe(0);
        });

        test('процентная скидка не делает цену отрицательной', () => {
            order.addItem({ name: 'A', price: 10, quantity: 1 });
            const result = order.applyCoupon({ type: 'percent', value: 200 });
            expect(result).toBe(0);
        });

        test('возвращает 0 для пустого заказа', () => {
            expect(order.applyCoupon({ type: 'fixed', value: 50 })).toBe(0);
        });

        test('выбрасывает ошибку при неизвестном типе купона', () => {
            order.addItem({ name: 'A', price: 10, quantity: 1 });
            expect(() => order.applyCoupon({ type: 'super', value: 5 }))
                .toThrow('Unknown coupon type');
        });
    });

    // Подтверждение и отмена
    describe('confirm()', () => {
        test('подтверждает заказ со статусом draft и товарами', () => {
            order.addItem({ name: 'Item', price: 10, quantity: 1 });
            order.confirm();
            expect(order.status).toBe('confirmed');
        });

        test('не подтверждает пустой заказ', () => {
            expect(() => order.confirm()).toThrow('Cannot confirm empty order');
        });

        test('не подтверждает уже подтверждённый заказ', () => {
            order.addItem({ name: 'Item', price: 1, quantity: 1 });
            order.confirm();
            expect(() => order.confirm()).toThrow('Only draft orders can be confirmed');
        });

        test('не подтверждает отменённый заказ', () => {
            order.addItem({ name: 'Item', price: 1, quantity: 1 });
            order.status = 'cancelled';
            expect(() => order.confirm()).toThrow('Only draft orders can be confirmed');
        });
    });

    describe('cancel()', () => {
        test('отменяет draft заказ', () => {
            order.addItem({ name: 'Item', price: 1, quantity: 1 });
            order.cancel();
            expect(order.status).toBe('cancelled');
        });

        test('отменяет подтверждённый заказ', () => {
            order.addItem({ name: 'Item', price: 1, quantity: 1 });
            order.confirm();
            order.cancel();
            expect(order.status).toBe('cancelled');
        });

        test('нельзя отменить уже отменённый заказ', () => {
            order.addItem({ name: 'Item', price: 1, quantity: 1 });
            order.cancel();
            expect(() => order.cancel()).toThrow('Order is already cancelled');
        });
    });
});