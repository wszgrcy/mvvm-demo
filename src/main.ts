import { MVVMDemo } from "./mvvm";

let mvvm = new MVVMDemo('#mvvm', {
    a: 1,
    b: { c: 2 },
    c: '1',
    type: 'number'
})
console.log(mvvm)
// console.log(mvvm.a)
console.log(mvvm.data.a)
mvvm.data.a = 6
console.log(mvvm.data.a)
mvvm.data.b.c = 9
mvvm.data.b = {
    c: 123
}
mvvm.data.b.c = 90;
// (mvvm as any).b = 999

setTimeout(() => {
    mvvm.data.b.c = 901;
    (mvvm as any).a = 99999
    mvvm.data.c = '23424'
    // mvvm.data.type = 'string'
}, 2999);