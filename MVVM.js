class MVVM{
    constructor(options){
        //将options挂载this上
        this.$el=options.el;
        this.$data=options.data;

        //编译模板
        // 如果有要编译的模板，就开始编译
        if(this.$el)
        {
            //数据劫持，把对象的所有属性改成get、set方法
            new Observer(this.$data);
            this.proxyData(this.$data);
            //用元素和数据进行编译
            new Compile(this.$el,this)
        }
    }
    proxyData(data){
        Object.keys(data).forEach(key=>{
            Object.defineProperty(this,key,{
                get(){
                    return data[key]
                },
                set(newValue){
                    data[key]=newValue;
                }
            })
        })
    }
   
}