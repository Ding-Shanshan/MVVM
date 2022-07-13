class Observer{
    constructor(data){
        this.observer(data)
    }
    observer(data){
        //要对这个data数据将原有的属性改成set和get的形式
        if(!data||typeof data!=='object')
        {
            return;
        }
        //将数据一一劫持  先获取到data的key和value
        Object.keys(data).forEach(key=>{
            //劫持对象
            this.defineReactive(data,key,data[key]);
            this.observer(data[key])
        });
    }

    //定义响应式
    defineReactive(obj,key,value){
        let that=this;
        let dep=new Dep();  //每个变化的数据，都会对应一个数组，这个数组是存放所有更新的操作
        Object.defineProperty(obj,key,{
            enumerable:true, //可枚举，循环时能循环出此值
            configurable:true, //是否可删除
            get(){
                Dep.target&&dep.addSub(Dep.target)
                return value;
            },
            set(newValue){
                if(newValue!==value)
                {
                    //这里的this不是实例,所以用that
                    that.observer(newValue);
                    value=newValue;
                    dep.notify();  //通知所有人 数据更新了
                }
            }
        })
    }
}

//发布订阅
class Dep{
    constructor(){
        //订阅的数组
        this.subs=[]
    }
    addSub(watcher){
        this.subs.push(watcher);
    }
    notify(){
        this.subs.forEach(watcher=>watcher.update());
    }
}