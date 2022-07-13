// 编译类
class Compile{
    constructor(el,vm){
        this.el=el==this.isElementNode(el)?el:document.querySelector(el);   
        this.vm=vm;
        if(this.el)
        {
            //如果这个元素能获取到 开始编译
            //1、先把真实的dom移入内存中 fragment
            let fragment=this.node2fragment(this.el)
            //2、编译，提取想要的元素节点v-model和文本节点{{}}
            this.compile(fragment);
            //把编译好的fragment再塞回到页面里去
            this.el.appendChild(fragment);
        }
    }

// 核心方法
    //将el中的内容全部放在内存中
    node2fragment(el){
        //文档碎片
        let fragment=document.createDocumentFragment();
        let firstChild;
        while(firstChild=el.firstChild)
        {
            fragment.appendChild(firstChild);
        }
        return fragment;  //内存中的节点
    }
    //编译方法
    compile(fragment){
        let childNodes=fragment.childNodes;
        Array.from(childNodes).forEach(node=>{
            if(this.isElementNode(node))
            {
                //是元素节点，利用递归拿到所有元素/文本
                //这离需要编译元素
                this.compileElement(node)
                this.compile(node)    
            }else{
                //是文本节点
                //这离需要编译文本
                this.compileText(node)
            }
        })
    }
    
    //编译元素
    compileElement(node){
        //节点属性为v-model
        let attrs=node.attributes;
        Array.from(attrs).forEach(attr=>{
            let attrName=attr.name
            //判断attr是不是指令
            if(this.isDirective(attrName))
            {
                //取到对应的值放到节点中
                let expr=attr.value;
                let type=attrName.slice(2);
                CompileUtil[type](node,this.vm,expr);
            }
        })
    }
    //编译文本
    compileText(node){
        //带{{}}
        let expr=node.textContent;
        let reg=/\{\{([^}]+)\}\}/g
        if(reg.test(expr))
        {
           //node this.vm.$data  
           CompileUtil['text'](node,this.vm,expr);
        }
    }


// 辅助方法
    //判断是否为元素节点
    isElementNode(node){
        return node.nodeType===1;
    }
    //判断是否为指令
    isDirective(name){
        return name.includes('v-')
    }
}

//编译工具
CompileUtil={
    getTextVal(vm,expr){
        return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            return this.getVal(vm,arguments[1])
        });
    },
    text(node,vm,expr){  //文本处理
        let updateFn=this.updater['textUpdater'];
        let value=this.getTextVal(vm,expr)
        expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            new Watcher(vm,arguments[1],(newValue)=>{
                //如果数据变化，文本节点需要重新获取依赖的属性更新文本中的内容
                updateFn&&updateFn(node,this.getTextVal(vm,expr))
            })
        });
        updateFn&&updateFn(node,value)
    },
    setVal(vm,expr,value){
        expr=expr.split('.');
        //收敛
        return expr.reduce((prev,next,currentIndex)=>{
            if(currentIndex===expr.length-1)
            {
                return prev[next]=value;
            }
            return prev[next];
        },vm.$data)

    },
    model(node,vm,expr){ //输入框处理
        let updateFn=this.updater['modelUpdater'];
        //此处监控数据变化，如果数据变化应该调用watch的callback
        new Watcher(vm,expr,(newValue)=>{
            //当值变化后会调用cb,将新值传递过来
            updateFn&&updateFn(node,this.getVal(vm,expr))
        })
        node.addEventListener('input',(e)=>{
            let newValue=e.target.value;
            this.setVal(vm,expr,newValue);
        })
        updateFn&&updateFn(node,this.getVal(vm,expr))
    },
    updater:{
        // 文本更新
        textUpdater(node,value){
            node.textContent=value;
        },
        //输入框更新
        modelUpdater(node,value){
            node.value=value;
        }
    },
    //获取实例上对应的数据
    getVal(vm,expr){
        expr=expr.split('.');
        return expr.reduce((prev,next)=>{
            return prev[next];
        },vm.$data)
    }
}


