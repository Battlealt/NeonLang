module.exports = test => {
    test(`
    let a = 35;
    a = fun() {53}
    a()
    (fun(a) {a+1})(53)
    `,
    54);
}