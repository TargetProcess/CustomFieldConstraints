webpackJsonp_mashup_CustomFieldConstraints([3],{28:function(e,t,n){"use strict";var i=n(4),r=n(29),s=n(30),o=n(31),a=n(32),u=n(33),c=n(51),d=n(52),l=[{pattern:/cfConstraints/,host:{name:"master empty",type:"master.empty"},type:{name:"cf constraints",type:"cf.constraints",namespace:"tau/cf.constraints"}}],f=function(e,t){return i.map(e.customFields,function(n){return i.find(t.processes[0].customFields,function(t){return t.entityKind.toLowerCase()==e.entity.entityType.name.toLowerCase()&&t.name==n.name})})};e.exports=function(e){e.addTargetprocessModule("tau/cf.constraints/components/component.cf.constraints",u);var t=new r,n=new o(t);n.getApplicationContext({ids:[e.entity.id]},{success:function(n){e.customFields=f(e,n);var r=e.placeholder,o="cf.constraints";t._id=i.uniqueId("cf.constraints"),t.registerService("navigator",new s(t,{parameterName:o})),t.registerService("cf.constraints.config",i.extend(e,{applicationContext:n})),t.getExternal().setFakeWindow(),t.getHashService().getHash()||t.service("navigator").to("cfConstraints");var u={name:"cf constraints",options:{applicationId:o,placeholder:r,integration:{showInPopup:!0,cssClass:"cf-constraints-popup",keepAlive:!1}},routes:l,context:{configurator:t},extensions:[c,d]},p=a.create(u);p.initialize(u)}})}},33:function(e,t,n){"use strict";var i=n(34),r=n(35),s=n(38);e.exports={create:function(e){var t={name:"cf constraints page component",extensions:[r],ViewType:s};return i.create(t,e)}}},35:function(e,t,n){"use strict";var i=n(4),r=n(36),s=n(8),o=n(37);e.exports=r.extend({"bus afterInit + afterRender":function(e,t,n){var i=t.config.context.configurator.service("cf.constraints.config");this._bindSave(i,n.element),this._bindRefreshOnFailure(i,t.config.context.configurator)},_bindSave:function(e,t){var n=t.find(".i-role-save");n.click(i.bind(function(n){n.preventDefault(),(new s).getEntity().ofType(e.entity.entityType.name).withId(e.entity.id).withFieldSetRestrictedTo(["customFields"]).withCallOnDone(i.bind(function(e,t,n,r){var s=i.filter(t,function(e){var t=i.find(r.customFields,function(t){return t.name==e.name});return"undefined"!=typeof t&&null!=t.value&&""!=t.value});s.length==t.length?n.resolve():e.find(".ui-customfield__value:empty").addClass("ui-validationerror")},this,t,e.customFields,e.entityDeferred)).execute()},this))},_bindRefreshOnFailure:function(e,t){t.getStore().on({eventName:"failure",listener:this},i.bind(function(e){i.each(e,function(e){o.getByName("customField-"+e.name).done(function(e){e.fire("refreshRow")})})},this,e.customFields))}})},38:function(e,t,n){"use strict";var i=n(4),r=n(39),s=n(40),o=n(41),a=n(42);e.exports=r.extend({init:function(e){this._super(e)},initialize:function(){},"bus beforeInit":function(){var e=this.config.context.configurator;e.getTitleManager().setTitle("CF Constraints");var t=e.service("cf.constraints.config"),n=this.config;this.setCustomFieldService(e,t);var r=i.extend(n,(new a).getConfig(t));this.container=s.create({name:"cf constraints page container",layout:r.layout,template:r.template,extensions:i.union([],r.extensions||[]),context:i.extend(n.context,{getCustomFields:function(){return t.customFields},entity:t.entity,applicationContext:t.applicationContext})}),this.container.on("afterInit",this["container afterInit"],this),this.container.on("afterRender",this["container afterRender"],this),this.container.on("componentsCreated",this["container componentsCreated"],this),this.container.initialize(r)},"container afterInit":function(){this.fireAfterInit()},"container componentsCreated":function(e){this.fire(e.name,e.data)},"container afterRender":function(e){this.fireBeforeRender(),this.element=e.data.element,this.fireAfterRender()},setCustomFieldService:function(e,t){this._customFieldsService=new o({configurator:e,entity:t.entity,customFields:t.customFields}),e.registerService("customFieldServiceV2",this._customFieldsService)},lifeCycleCleanUp:function(){this.destroyContainer(),this._super()},destroyContainer:function(){this.container&&(this.container.destroy(),this.container=null)},destroy:function(){this._customFieldsService&&this._customFieldsService.destroy(),this.destroyContainer(),this._super()}})},42:function(e,t,n){"use strict";var i=n(4),r=n(10),s=n(43),o=n(45),a=n(49),u=r.extend({getConfig:function(e){e.addTargetprocessModule("tau/cf.constraints/components/component.cf.constraints.header",o),e.addTargetprocessModule("tau/cf.constraints/components/component.cf.constraints.save",a);var t=i.map(e.customFields,function(e){var t=e.type.toLowerCase();switch(t){case"multipleselectionlist":return this._getEditorConfig(e,"multiselect");case"richtext":return this._getRichTextEditorConfig(e);default:return this._getEditorConfig(e,t)}}.bind(this));return t.push({selector:".i-role-entity-name",namespace:"tau/cf.constraints",type:"cf.constraints.header"}),t.push({selector:".i-role-save",namespace:"tau/cf.constraints",type:"cf.constraints.save"}),{layout:"selectable",template:s,children:t}},_getEditorConfig:function(e,t,n){return{selector:n||".i-role-customFields",type:"customField."+t,customField:e,name:"customField-"+e.name}},_getRichTextEditorConfig:function(e){return{type:"container",name:"customField-"+e.name+"-container",selector:".i-role-customFields",template:{name:"cf.constraints.richText",markup:['<div class="ui-customfield  ui-customfield_empty_true ui-customfield_editable_true cf-constraints-richText">',"<table><tbody><tr>",'<td class="ui-customfield__label">',e.name,"</td>",'<td class="ui_custom_field_value_container i-role-richText"></td>',"</tr></tbody></table>","</div>"]},layout:"selectable",children:[this._getEditorConfig(e,"richtext",".i-role-richText")]}}});e.exports=u},43:function(e,t,n){"use strict";var i=n(44),r={name:"cf.constraints",engine:"jqote2",markup:['<div class="cf-constraints-container tau-page-entity main-container">','<div class="cf-constraints-entity-name tau-entity-caption i-role-entity-name"></div>','<div class="cf-constraints-note">Please specify the following custom fields</div>','<div class="cf-constraints-customFields i-role-customFields"></div>','<div class="cf-constraints-save i-role-save"></div>',"</div>"]};e.exports=i.register(r)},45:function(e,t,n){"use strict";var i=n(46),r=n(47),s=n(48);e.exports={create:function(e){var t={extensions:[r],template:s};return i.create(t,e)}}},47:function(e,t,n){"use strict";var i=n(36);e.exports=i.extend({"bus afterInit":function(e,t){this.fire("dataBind",{entity:t.config.context.entity})}})},48:function(e,t,n){"use strict";var i=n(44),r={name:"cf.constraints.header",engine:"jqote2",markup:["<div>",'<em class="ui-type-icon ui-type-icon-<%! this.entity.entityType.name.toLowerCase() %>"><%! this.entity.id %></em>',"<%! this.entity.name %>","</div>"]};e.exports=i.register(r)},49:function(e,t,n){"use strict";var i=n(46),r=n(47),s=n(50);e.exports={create:function(e){var t={extensions:[r],template:s};return i.create(t,e)}}},50:function(e,t,n){"use strict";var i=n(44),r={name:"cf.constraints.save",engine:"jqote2",markup:["<div>",'<div class="i-role-error-message" style="display: none;">Please enter all custom fields</div>','<div><button type="button" class="tau-btn tau-primary i-role-save">Save and Continue</button></div>',"</div>"]};e.exports=i.register(r)},52:function(e,t,n){"use strict";var i=n(4),r=n(36),s=n(8);e.exports=r.extend({"bus afterInit + $popup.ready":function(e,t,n){n.tauPopup("option",{enableClose:!1});var r=t.config.context.configurator.service("cf.constraints.config"),s=i.bind(this._reset,this,r),o=n.tauPopup("widget").find(".close");r.entityDeferred.done(i.bind(this._exit,this)),n.tauPopup({show:i.bind(function(e,t){e.off("click"),e.on("click",i.bind(function(e){e.preventDefault(),t()},this))},this,o,s)})},"bus afterInit > destroy":function(e,t,n){n&&n.doNotReset||this._reset(t.config.context.configurator.service("cf.constraints.config"))},_exit:function(){this.fire("destroy",{doNotReset:!0})},_reset:function(e){var t={customFields:i.map(e.customFields,function(e){return{name:e.name,type:e.type,value:null}},this)};(new s).updateEntity().ofType(e.entity.entityType.name).withId(e.entity.id).usingFieldValues(t).withCallOnDone(i.bind(function(){e.entityDeferred.reject({response:{Message:"The changes were not saved as you didn't fill out the required custom fields"},status:400}),this._exit()},this)).execute()}})},53:function(e,t,n){var i=n(54);"string"==typeof i&&(i=[[e.id,i,""]]);n(56)(i,{});i.locals&&(e.exports=i.locals)},54:function(e,t,n){t=e.exports=n(55)(),t.push([e.id,".cf-constraints-popup{position:fixed;top:50%;left:50%;right:inherit;bottom:inherit;margin-top:-200px;margin-left:-300px;width:530px;font-family:Arial,sans-serif;font-size:12px}.cf-constraints-container{max-height:400px;overflow:auto}.cf-constraints-entity-name{padding:0 10px;margin-bottom:10px}.cf-constraints-entity-name .ui-type-icon{margin-right:5px}.cf-constraints-customFields{padding-bottom:15px}.cf-constraints-note{color:#606B73;padding:10px;background-color:#FFFFE1;margin-bottom:5px}.cf-constraints-save{margin-left:8px;margin-top:10px}.cf-constraints-customFields .ui_custom_field_value_container{border:1px solid #CCC;border-radius:3px!important}.cf-constraints-customFields .ui-customfield{margin-bottom:5px}.cf-constraints-customFields .ui-customfield_editable_true:hover .ui-customfield__label{background:#fff}.cf-constraints-customFields .ui-customfield-richtext .ui-customfield__value.editable:hover{background:#FFFFE1}.cf-constraints-richText .ui_custom_field_value_container{padding:0}.cf-constraints__formrow{display:flex;margin-bottom:5px;margin-left:10px;align-items:baseline}.cf-constraints__label{width:100px;color:#999}.cf-constraints__formrow>input,.cf-constraints__formrow>select{flex:1 1 auto}",""])},55:function(e,t){e.exports=function(){var e=[];return e.toString=function(){for(var e=[],t=0;t<this.length;t++){var n=this[t];n[2]?e.push("@media "+n[2]+"{"+n[1]+"}"):e.push(n[1])}return e.join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var i={},r=0;r<this.length;r++){var s=this[r][0];"number"==typeof s&&(i[s]=!0)}for(r=0;r<t.length;r++){var o=t[r];"number"==typeof o[0]&&i[o[0]]||(n&&!o[2]?o[2]=n:n&&(o[2]="("+o[2]+") and ("+n+")"),e.push(o))}},e}},56:function(e,t,n){function i(e,t){for(var n=0;n<e.length;n++){var i=e[n],r=l[i.id];if(r){r.refs++;for(var s=0;s<r.parts.length;s++)r.parts[s](i.parts[s]);for(;s<i.parts.length;s++)r.parts.push(a(i.parts[s],t))}else{for(var o=[],s=0;s<i.parts.length;s++)o.push(a(i.parts[s],t));l[i.id]={id:i.id,refs:1,parts:o}}}}function r(e){for(var t=[],n={},i=0;i<e.length;i++){var r=e[i],s=r[0],o=r[1],a=r[2],u=r[3],c={css:o,media:a,sourceMap:u};n[s]?n[s].parts.push(c):t.push(n[s]={id:s,parts:[c]})}return t}function s(){var e=document.createElement("style"),t=h();return e.type="text/css",t.appendChild(e),e}function o(){var e=document.createElement("link"),t=h();return e.rel="stylesheet",t.appendChild(e),e}function a(e,t){var n,i,r;if(t.singleton){var a=g++;n=m||(m=s()),i=u.bind(null,n,a,!1),r=u.bind(null,n,a,!0)}else e.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=o(),i=d.bind(null,n),r=function(){n.parentNode.removeChild(n),n.href&&URL.revokeObjectURL(n.href)}):(n=s(),i=c.bind(null,n),r=function(){n.parentNode.removeChild(n)});return i(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;i(e=t)}else r()}}function u(e,t,n,i){var r=n?"":i.css;if(e.styleSheet)e.styleSheet.cssText=v(t,r);else{var s=document.createTextNode(r),o=e.childNodes;o[t]&&e.removeChild(o[t]),o.length?e.insertBefore(s,o[t]):e.appendChild(s)}}function c(e,t){var n=t.css,i=t.media;t.sourceMap;if(i&&e.setAttribute("media",i),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}function d(e,t){var n=t.css,i=(t.media,t.sourceMap);i&&(n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(i))))+" */");var r=new Blob([n],{type:"text/css"}),s=e.href;e.href=URL.createObjectURL(r),s&&URL.revokeObjectURL(s)}var l={},f=function(e){var t;return function(){return"undefined"==typeof t&&(t=e.apply(this,arguments)),t}},p=f(function(){return/msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())}),h=f(function(){return document.head||document.getElementsByTagName("head")[0]}),m=null,g=0;e.exports=function(e,t){t=t||{},"undefined"==typeof t.singleton&&(t.singleton=p());var n=r(e);return i(n,t),function(e){for(var s=[],o=0;o<n.length;o++){var a=n[o],u=l[a.id];u.refs--,s.push(u)}if(e){var c=r(e);i(c,t)}for(var o=0;o<s.length;o++){var u=s[o];if(0===u.refs){for(var d=0;d<u.parts.length;d++)u.parts[d]();delete l[u.id]}}}};var v=function(){var e=[];return function(t,n){return e[t]=n,e.filter(Boolean).join("\n")}}()}});