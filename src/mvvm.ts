import { BindAttribute } from "./mvvm.interface";


const BIND_PROPERTY: BindAttribute = {
    module: ['[module]', '(module)', '[(module)]']
}
enum BIND_TYPE {
    input = 0, output, double
}
export class MVVMDemo {
    data: any = {}
    private element: HTMLElement
    constructor(private selector: string, data: { [name: string]: any }) {
        this.element = document.querySelector(selector);
        console.assert(this.element, '未选中元素')
        this.setListener(data)
        //doc 绑定属性到根上
        for (const x in this.data) {
            if (this.data.hasOwnProperty(x)) {
                Object.defineProperty(this, x, {
                    get() {
                        return this.data[x];
                    },
                    set: (val) => {
                        this.data[x] = val
                    }
                })
            }
        }
        this.bindTemplate()
    }

    bindTemplate() {
        let fragment = document.createDocumentFragment();
        while (this.element.firstChild) {
            fragment.appendChild(this.element.firstChild)
        }
        this.element.appendChild(this._bindTemplate(fragment))
        this.call()
    }
    private bindMap = new Map([
        [{
            type: BIND_TYPE.input, regexp: /^\[([^\(\)]+?)\]$/
        }, (path, node, bindAttributeName?: string) => { this.list.push(() => this.setInputBind(path, node, bindAttributeName)) }],
        [{
            type: BIND_TYPE.output, regexp: /^\((.*?)\)$/
        }, (path, node, eventName?: string) => { this.setOutputBind(path, node, eventName) }],
        [{
            type: BIND_TYPE.double, regexp: /^null$/
        }, (path, node, bindAttributeName?: string) => {
            this.list.push(() => this.setInputBind(path, node, bindAttributeName))
            this.setOutputBind(path, node, bindAttributeName)
        }]
    ])

    /**
     * @description 绑定节点的数据,对内容的绑定和对标签属性事件的绑定
     * @author cyia
     * @date 2019-02-25
     * @private
     * @param node
     * @returns
     * @memberof MVVMDemo
     */
    private _bindTemplate(node: Node) {
        Array.from(node.childNodes).forEach((node) => {
            let { nodeType: type, textContent: content } = node
            if (type === 3) {
                this.list.push(() => {
                    let str = content.replace(/{{(.*?)}}/g, (substring, ...args) => {
                        let path: string[] = args[0].split('.')
                        let attributeName;
                        let value = this.data
                        while (attributeName = path.shift()) {
                            value = value[attributeName]
                        }
                        return value
                    })
                    node.textContent = str
                })
            } else if (type === 1) {
                this._bindTemplate(node)
                if (node instanceof HTMLInputElement) {
                    //doc 特殊处理
                    BIND_PROPERTY.module.forEach((value, i) => {
                        if (!value) return
                        let path = node.getAttribute(value);
                        if (path) {
                            [...this.bindMap].filter(([{ type }]) => type == i).forEach(([, fn]) => fn(path.split('.'), node))
                        }
                    })
                    let list = node.getAttributeNames()
                    list.forEach((value) => {
                        let path = node.getAttribute(value);
                        if (path) {
                            [...this.bindMap]
                                .map(([{ regexp }, fn]) => [fn, regexp.exec(value)])
                                .filter(([fn, result]) => result)
                                .filter(() => !Object.keys(BIND_PROPERTY).some((val) => val == value))
                                .forEach(([fn, result]: [Function, any]) => {
                                    console.log('结果', result)
                                    fn(path.split('.'), node, result[1])
                                })
                        }
                    })
                }
            }

        })
        return node
    }
    /**
     * @description 设置事件监听
     * @author cyia
     * @date 2019-02-25
     * @param path 路径数组
     * @param node 节点
     * @param [eventName='input'] 绑定事件
     * @memberof MVVMDemo
     */
    setOutputBind(path: string[], node, eventName = 'input') {
        node.addEventListener(eventName, (e: KeyboardEvent) => {
            let attributeName;
            let value = this.data
            while (path.length > 1 && (attributeName = path.shift())) {
                value = value[attributeName]
            }
            value[path[0]] = node.value
        })
    }
    /**
     * @description 对输入属性的绑定
     * @author cyia
     * @date 2019-02-25
     * @param path 路径数组
     * @param node 绑定节点
     * @param [bindAttributeName=''] 要绑定的属性名
     * @memberof MVVMDemo
     */
    setInputBind(path: string[], node: HTMLElement & HTMLInputElement, bindAttributeName: string = '') {
        path = Array.from(path)
        let attributeName;
        let value = this.data
        while (attributeName = path.shift()) {
            value = value[attributeName]
        }
        if (bindAttributeName) {
            node.setAttribute(bindAttributeName, value)
        } else {
            node.value = value
        }
    }
    /**
     * @description 对象劫持
     * @author cyia
     * @date 2019-02-25
     * @param data 原始数据
     * @param [target=this.data] 放置目标
     * @returns
     * @memberof MVVMDemo
     */
    setListener(data, target = this.data) {
        if (!(data instanceof Object)) return
        for (const key in data) {
            if (!data.hasOwnProperty(key)) continue
            let value = data[key];
            Object.defineProperty(target, key, {
                get() {
                    return value
                },
                set: (val) => {
                    if (val !== value) {
                        value = val
                        this.call()
                        this.setListener(value, target[key])
                    }
                },
                enumerable: true,
                configurable: true
            })
            this.setListener(value, target[key])

        }
    }
    list: any[] = []
    call() {
        this.list.forEach((fn) => {
            fn()
        })
    }
}