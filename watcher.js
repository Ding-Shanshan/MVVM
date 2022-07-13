//观察者的目的是给需要变化的那个dom增加一个观察者，但数据变化后执行对应的方法
class Watcher{
    constructor(vm,expr,cb){
        this.vm=vm;
        this.expr=expr;
        this.cb=cb;
        //先获取老值
        this.value=this.get();
    } 
    getVal(vm,expr){
        expr=expr.split('.');
        return expr.reduce((prev,next)=>{
            return prev[next];
        },vm.$data);
    }
    get(){
        Dep.target=this;
        let value=this.getVal(this.vm,this.expr);
        Dep.target=null;
        return value;
    }
    //对外暴露的方法
    update(){
        let newValue=this.getVal(this.vm,this.expr)
        let oldValue=this.value;
        if(newValue!=oldValue)
        {
            this.cb(newValue)  //对应的watch的callback
        }
    }
}