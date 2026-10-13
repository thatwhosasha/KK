
function getTriangleType(a, b, c) {
    const sides = [a, b, c].map(Number);
    if (sides.some(isNaN)) return 'неизвестная ошибка';
    const [x, y, z] = sides;
    if (x <= 0 || y <= 0 || z <= 0) return 'не треугольник';
    if (x + y <= z || x + z <= y || y + z <= x) return 'не треугольник';

    if (x === y && y === z) return 'равносторонний';
    if (x === y || x === z || y === z) return 'равнобедренный';
    return 'обычный';
}

const args = process.argv.slice(2);
if (args.length !== 3) {
    console.log('неизвестная ошибка');
    process.exit(1);
}

const result = getTriangleType(args[0], args[1], args[2]);
console.log(result);