(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-c962e154"],{"21fd":function(e,t,s){"use strict";var r=s("8932"),n=s.n(r);n.a},"35b8":function(e,t,s){"use strict";var r=s("a05f"),n=s.n(r);n.a},"4f91":function(e,t,s){"use strict";var r=function(){var e,t,s=this,r=s.$createElement,n=s._self._c||r;return"textarea"===s.type?n("div",{staticClass:"x-textarea-wrapper"},[n("textarea",{ref:"myTextarea",style:s.xStyle,domProps:{value:s.value},on:{change:function(e){s.$emit("change",e)},input:s.onInput,focus:function(e){s.$emit("focus",e)},blur:function(e){s.$emit("blur",e)}}})]):n("div",{staticClass:"x-input",class:{error:s.error,disabled:s.disabled}},[s.icon?n("x-icon",{staticClass:"icon",class:{focus:s.focus||s.value},attrs:{name:s.icon}}):s._e(),n("x-icon",{staticClass:"error",attrs:{name:"error"}}),n("input",{ref:"input",class:(e={},e["no-icon"]=!s.icon,e),attrs:{type:s.type},domProps:{value:s.value},on:{focus:s.onFocus,blur:s.onBlur,input:s.onInput,change:s.onChange}}),s.placeholder?n("label",{class:(t={focus:s.focus||s.value},t["no-icon"]=!s.icon,t)},[s._v(s._s(s.placeholder))]):s._e()],1)},n=[],a=s("61e6"),o={name:"xInput",components:{xIcon:a["a"]},props:{placeholder:String,value:String,icon:String,type:{type:String,default:"text"},disabled:{type:Boolean,default:!1},error:{type:Boolean,default:!1},resize:{type:Boolean,default:!1}},data:function(){return{focus:!1}},computed:{xStyle:function(){return this.resize?{resize:"auto"}:{resize:"none"}}},methods:{onFocus:function(e){this.focus=!0,this.$emit("focus",e),this.disabled&&this.$refs.input.blur()},onBlur:function(e){this.disabled||(this.focus=!1,this.$emit("blur",e))},onInput:function(e){this.$emit("input",e.target.value)},onChange:function(e){this.$emit("change",e)}}},i=o,u=(s("21fd"),s("2877")),c=Object(u["a"])(i,r,n,!1,null,"7f91d424",null);c.options.__file="input.vue";t["a"]=c.exports},8932:function(e,t,s){},a05f:function(e,t,s){},bb51:function(e,t,s){"use strict";s.r(t);var r=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"home"},[s("x-icon",{staticClass:"icon",attrs:{name:"logo-copy"}}),s("div",{staticClass:"login"},[s("div",{staticClass:"error"},[s("x-icon",{directives:[{name:"show",rawName:"v-show",value:e.error,expression:"error"}],staticStyle:{"margin-right":"4px"},attrs:{name:"error"}}),s("span",{directives:[{name:"show",rawName:"v-show",value:e.error,expression:"error"}],staticStyle:{cursor:"default"}},[e._v(e._s(e.error))])],1),s("div",{staticClass:"form"},[s("x-input",{attrs:{icon:"username",placeholder:"请输入用户名"},model:{value:e.username,callback:function(t){e.username="string"===typeof t?t.trim():t},expression:"username"}}),s("x-input",{attrs:{icon:"lock",placeholder:"请输入密码",type:"password"},model:{value:e.password,callback:function(t){e.password=t},expression:"password"}})],1),s("div",{staticClass:"button",attrs:{role:"button"},on:{click:e.onLogin}},[e._v("登 录")]),s("span",{staticClass:"info"},[e._v("若为未注册用户，将自动为您注册")])])],1)},n=[],a=s("be94"),o=(s("cadf"),s("551c"),s("097d"),s("61e6")),i=s("4f91"),u=s("2f62"),c={name:"Home",components:{xIcon:o["a"],xInput:i["a"]},data:function(){return{username:"",password:"",error:""}},created:function(){var e=localStorage.getItem("username");e&&(this.username=e)},methods:Object(a["a"])({},Object(u["c"])(["setUser"]),Object(u["b"])(["login","signUp"]),{onLogin:function(){var e=this;if(this.username&&this.password){var t=/^[\u4e00-\u9fa5\w]{5,10}$/,s=/.{6,18}/;t.test(this.username)?s.test(this.password)?(this.error="",this.login({username:this.username,password:this.password}).then(function(t){var s=t.id,r=t.attributes.username;localStorage.setItem("username",r),e.setUser({id:s,username:r}),e.$router.push("/user")}).catch(function(t){210===t.code?e.error="密码不正确":211===t.code?e.signUp({username:e.username,password:e.password}).then(function(t){var s=t.id,r=t.attributes.username;localStorage.setItem("username",r),e.setUser({id:s,username:r}),e.$router.push("/user")}):e.error="系统异常"})):this.error="密码为6到18个字符":this.error="用户名为5到10个字母、数字、下划线或汉字"}else this.error="用户名或密码不能为空"}})},l=c,p=(s("35b8"),s("2877")),d=Object(p["a"])(l,r,n,!1,null,"b030bb82",null);d.options.__file="Home.vue";t["default"]=d.exports}}]);
//# sourceMappingURL=chunk-c962e154.1991feff.js.map