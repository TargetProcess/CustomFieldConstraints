/*! v0.1.0 Build Thu Dec 03 2015 17:15:04 GMT+0300 (MSK) */
!function(){var e={},t=function(){var t,n,i,r=Array.prototype.slice.call(arguments,0);"string"==typeof r[0]?(i=r[0],t=r[1],n=r[2]):Array.isArray(r[0])&&(t=r[0],n=r[1]);var s=t.reduce(function(e,t){return e.addDependency(t)},tau.mashups);return s=s.addDependency(i+"/config"),s=s.addMashup(function(){var r=Array.prototype.slice.call(arguments,0);if(t.length>0&&1===r.length)throw new Error("Can't properly load dependencies for mashup \""+i+'", mashup is stopped.');return e.variables=r[r.length-1],r.length-t.length===2?e.config=r[r.length-2]:e.config={},Object.freeze&&(Object.freeze(e.variables),Object.freeze(e.config),Object.freeze(e)),n.apply(null,r)})};t("CustomFieldConstraints",["Underscore","jQuery","tp3/mashups/storage","tau/libs/store2/store2","tau/core/class","tp3/mashups/sliceinterrupter","tp3/mashups/componenteventlistener","tau/service.container","tau/services/service.navigator","tau/services/service.applicationContext","tau/components/component.application.generic","tau/components/component.page.base","tau/core/extension.base","tau/core/bus.reg","tau/core/view-base","tau/components/component.container","tau/services/service.customFields.cached","tau/core/templates-factory","tau/components/component.creator","tau/ui/extensions/application.generic/ui.extension.application.generic.placeholder","react","tau/configurator","tau/utils/utils.date"],function(t,n,i,r,s,a,o,u,c,d,l,f,p,h,g,m,y,v,_,C,F,w,E){return function(t){function n(e){if(r[e])return r[e].exports;var i=r[e]={exports:{},id:e,loaded:!1};return t[e].call(i.exports,i,i.exports,n),i.loaded=!0,i.exports}var i=window.webpackJsonp_mashup_CustomFieldConstraints;window.webpackJsonp_mashup_CustomFieldConstraints=function(e,r){for(var a,o,u=0,c=[];u<e.length;u++)o=e[u],s[o]&&c.push.apply(c,s[o]),s[o]=0;for(a in r)t[a]=r[a];for(i&&i(e,r);c.length;)c.shift().call(null,n)};var r={},s={2:0};return n.e=function(e,t){if(0===s[e])return t.call(null,n);if(void 0!==s[e])s[e].push(t);else{s[e]=[t];var i=document.getElementsByTagName("head")[0],r=document.createElement("script");r.type="text/javascript",r.charset="utf-8",r.async=!0,r.src=n.p+"chunks/"+e+"."+({3:"ApplicationOld",4:"FormContainer"}[e]||e)+".15df0c91a8dbb1de17d4.js",i.appendChild(r)}},n.m=t,n.c=r,n.p="",n.p=e.variables?e.variables.mashupPath:n.p,n(0)}([function(e,t,n){n(3),n(56),n(64),n(72),n(39),n(45),n(28),n(29),n(30),n(31),n(50),n(33),n(9),n(35),n(36),n(7),n(43),n(38),n(40),e.exports=n(8)},,,function(t,n,i){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}var s=i(4),a=i(5),o=r(a),u=i(10),c=r(u),d=i(11),l=r(d),f=i(14),p=r(f),h=i(16),g=r(h),m=i(19),y=r(m),v=i(20),_=r(v),C=e.variables.placeholderId,F=e.config,w=function(e,t){var n=e.entity,r=e.processId,s=e.requirementsData;i.e(4,function(){var e=i(56),a=i(57),o=document.getElementById(C).appendChild(document.createElement("div")),u=function(){e.unmountComponentAtNode(o),t.reject({response:{Message:"The changes were not saved as you didn't fill out the required custom fields"},status:400})},c=function(){e.unmountComponentAtNode(o),t.resolve()};e.render(e.createElement(a,{entity:n,mashupConfig:F,onAfterSave:c,onCancel:u,processId:r,requirementsData:s}),o)})},E=function(){w.apply(void 0,arguments)},b=function(){var e=new o["default"],t=new c["default"](F),n=[new l["default"](e,t,E),new p["default"](e,t,E),new g["default"](e,t,E),new y["default"](e,t,E),new _["default"](e,t)];s.invoke(n,"subscribe")};b()},function(e,n){e.exports=t},function(e,t,n){"use strict";var i=n(6),r=n(4),s=n(7),a=n(8),o=n(9),u=o.extend({init:function(){this.storage=new s},getEntitiesDetailsPromise:function(e,t){var n=i.Deferred();return this.storage.getEntities().ofType(t).filteredBy({id:{$in:e}}).withFieldSetRestrictedTo(this._getEntitiesDetailsFilter(t)).withCallOnDone(function(e){n.resolve(r.map(e,r.bind(function(e){return e&&e.entityType&&(e.type=e.entityType.name),e},this)))}).execute(),n.promise()},getDefaultProcessPromise:function(){var e=i.Deferred();return this.storage.getEntities().ofType("process").filteredBy({isDefault:{$eq:"true"}}).withFieldSetRestrictedTo(["id"]).withCallOnDone(function(t){var n=t[0];e.resolve(n)}).execute(),e.promise()},getEntityStatesDetailsPromise:function(e,t,n){var r=i.Deferred();return this.storage.getEntities().ofType("entityState").filteredBy(this._getEntityStateFilter(t,n)).withFieldSetRestrictedTo([{workflow:["id"]},{process:["id"]},{entityType:["name"]},"name","isInitial","isFinal","isPlanned",{subEntityStates:["id","name",{workflow:["id"]},"isInitial","isFinal","isPlanned"]}]).withCallOnDone(r.resolve).execute(),r.promise()},getTasksDetailsPromise:function(e){var t=i.Deferred(),n=r.chain(e).filter(function(e){return"userstory"===e.entityType.name.toLowerCase()}).map(function(e){return r.filter(e.tasks,function(e){return!e.isFinal})}).flatten().map(function(e){return e.id}).value();return n.length>0?this.storage.getEntities().ofType("task").filteredBy({id:{$in:n}}).withFieldSetRestrictedTo(["id","name","customFields",{entityType:["name"]},{project:[{process:["id"]}]},{userStory:["id","name"]}]).withCallOnDone(t.resolve).execute():t.resolve([]),t.promise()},getTeamProjectsPromise:function(e){var t=r.chain(e).filter(function(e){return e.project&&!r.isEmpty(e.assignedTeams)}).map(function(e){return r.pluck(e.project.teamProjects,"id")}).flatten().unique().value();if(r.isEmpty(t))return i.when([]);var n=i.Deferred();return this.storage.getEntities().ofType("teamProject").filteredBy({id:{$in:t}}).withFieldSetRestrictedTo([{team:["id"]},{project:["id"]},{workflows:["id","name",{entityType:["name"]},{parentWorkflow:["id"]}]}]).withCallOnDone(n.resolve).execute(),n.promise()},getEntityStatesForTypesAndProcessesPromise:function(e,t,n){var i="%22"+t.join("%22,%20%22")+"%22",r=n.join(",%20");return new a(e).findAll("entitystate?take=1000&skip=0&select=new%20%28id,%20name,%20isInitial,%20isFinal,%20isPlanned,%20entityType%20as%20entityType,%20process%20as%20process%29&where=entityType.name%20in%20["+i+"]%20and%20process.id%20in%20["+r+"]")},getCustomFieldsForTypesAndProcessesPromise:function(e,t,n){var i="%22"+t.join("%22,%20%22")+"%22",r=n.join(",%20");return new a(e).findAll("customfield?take=1000&skip=0&select=new%20(required,name,%20id,%20config,%20fieldType,%20value,%20entityType.name%20as%20entityTypeName,process.id%20as%20processId)&where=entityType.name%20in%20["+i+"]%20and%20process.id%20in%20["+r+"]")},getEntityProcessId:function(e,t){return"project"===e.entityType.name.toLowerCase()?e.process.id:e.project?e.project.process.id:t.id},_getEntitiesDetailsFilter:function(e){var t=["customFields","name",{entityType:["name"]}];return t.push(this._isProjectType(e)?{process:["id"]}:{project:[{process:["id"]},{teamProjects:["id"]}]}),"userstory"===e.toLowerCase()&&t.push({tasks:["id","name",{entityState:["isFinal"]}]}),this._isAssignableType(e)&&t.push({assignedTeams:["id",{team:["id"]}]}),t},_getEntityStateFilter:function(e,t){var n=r.chain(e).map(function(e){return this.getEntityProcessId(e,t)},this).unique().value();return{process:{id:{$in:n}}}},_isProjectType:function(e){return"project"===e.toLowerCase()},_isAssignableType:function(e){return r.contains(["epic","feature","userstory","request","bug","task","testplan","testplanrun"],e.toLowerCase())}});e.exports=u},function(e,t){e.exports=n},function(e,t){e.exports=i},function(e,t){e.exports=r},function(e,t){e.exports=s},function(e,t,n){"use strict";function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),s=n(4),a=function(){function e(t){i(this,e),this.config=t}return r(e,[{key:"getConfig",value:function(){return this.config}},{key:"getEntityTypesToInterrupt",value:function(){var e=s.reduce(this.config,function(e,t){return e.concat(s.keys(t.constraints))},[]);return s.uniq(e)}},{key:"getRequiredCFsForState",value:function(e){var t=this.getEntityTypeCFConstraintsRule(e);if(!t)return[];var n=t.entityStates,i=s.filter(n,function(t){return t.name.toLowerCase()===e.requirementsData.newState.name.toLowerCase()});return this._getRequiredCFs(e,i)}},{key:"getRequiredCFsForCFs",value:function(e){var t=this.getEntityCFConstraints(e);if(!t)return[];var n=s.reduce(e.requirementsData.changedCFs,function(e,n){var i=s.filter(t,function(e){return e.name.toLowerCase()===n.name.toLowerCase()&&(e.valueIn?s.some(e.valueIn,function(e){return e===n.value}):s.every(e.valueNotIn,function(e){return e!==n.value}))});return e.concat(i)},[]);return this._getRequiredCFs(e,n)}},{key:"getEntityTypeCFConstraintsRule",value:function(e){var t=this.getProcessCFConstraintsRule(e);return t?t.constraints[e.entity.entityType.name.toLowerCase()]:null}},{key:"getEntityCFConstraints",value:function(e){var t=this.getEntityTypeCFConstraintsRule(e);return t?t.customFields:null}},{key:"getProcessCFConstraintsRule",value:function(e){return s.find(this.config,function(t){return Number(t.processId)===Number(e.processId)})}},{key:"_getRequiredCFs",value:function(e,t){var n=s.reduce(t,function(t,n){var i=s.filter(e.entity.customFields,function(e){return s.find(n.requiredCustomFields,function(t){return e.name.toLowerCase()===t.toLowerCase()&&(!e.value||""===e.value.toString())})});return t.concat(i)},[]);return s.uniq(n)}}]),e}();t["default"]=a,e.exports=t["default"]},function(e,t,n){"use strict";var i=n(4),r=n(7),s=n(12),a=s.extend({_getInterrupter:function(){return new r},_getChangedEntityId:function(e){return e.id},_getNewState:function(e,t,n){var r=i.find(n,function(t){return t.id===e.id}),s=i.find(r.changes,function(e){return this._shouldChangeBeHandled(e)},this);return this._getStateFromChange(t,s)},_getStateFromChange:function(e,t){if(this._isTeamStateChange(t)){var n=t.value;return i.isArray(n)&&1===n.length&&n[0].entityState?this._getTeamStateFromChange(e,n[0].entityState.id):null}var r=t.value.id;return i.find(e,function(e){return e.id===r})},_getTeamStateFromChange:function(e,t){return i.find(e,function(e){return i.some(e.subEntityStates,function(e){return e.id===t})})}});e.exports=a},function(e,t,n){"use strict";var i=n(6),r=n(4),s=n(13),a=s.extend({_shouldChangeBeHandled:function(e){return e.name&&r.contains(["entitystate","assignedteams","teamentitystate"],e.name.toLowerCase())},_isTeamStateChange:function(e){return e.name&&r.contains(["assignedteams","teamentitystate"],e.name.toLowerCase())},_getEntityRequiredCFs:function(e){return this.requirements.getRequiredCFsForState(e)},_buildEntitiesWithRequirements:function(e,t,n){var r=this.dataProvider.getTeamProjectsPromise(e),s=this.dataProvider.getEntityStatesDetailsPromise(t,e,n),a=this.dataProvider.getTasksDetailsPromise(e);return i.when(r,s,a).then(function(i,r,s){return this._getEntitiesWithRequirements(e,r,t,n,s,i)}.bind(this))},_getEntitiesWithRequirements:function(e,t,n,i,s,a){var o=r.map(e,function(e){var r=[],o=this._getNewState(e,t,n,i,a);if(o){var u={entity:e,processId:this.dataProvider.getEntityProcessId(e,i),requirementsData:{newState:o}};"userstory"===e.entityType.name.toLowerCase()&&o.isFinal&&(r=r.concat(this._getUserStoryTasksToHandle(u,s,t,i))),r.push(u)}return r},this);return r.flatten(o,!0)},_getUserStoryTasksToHandle:function(e,t,n,i){var s=e.entity,a=r.filter(t,function(e){return e.userStory.id==s.id});if(0===a.length)return[];var o=r.find(n,function(t){return t.isFinal&&t.process.id==e.processId&&"task"===t.entityType.name.toLowerCase()});return r.map(a,function(e){return{entity:e,processId:this.dataProvider.getEntityProcessId(e,i),requirementsData:{newState:o}}},this)},_getNewState:function(e,t,n,i,r){this._throwNotImplemented()}});e.exports=a},function(e,t,n){"use strict";var i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(e[i]=n[i])}return e},r=n(6),s=n(4),a=n(9),o=a.extend({init:function(e,t,n){this.dataProvider=e,this.requirements=t,this.requireEntityCFsCallback=n},subscribe:function(){var e=this.requirements.getEntityTypesToInterrupt(),t=this._getInterrupter();s.forEach(e,function(e){t.interruptSave(e,s.bind(function(t,n){var i=this._filterChangesToHandle(n);return 0==i.length?void t.resolve():void this._processChangesToHandle(i,e,t)},this))},this)},_throwNotImplemented:function(){throw new Error("Not implemented")},_getInterrupter:function(){this._throwNotImplemented()},_filterChangesToHandle:function(e){return s.filter(e,s.bind(function(e){return s.some(e.changes,s.bind(function(e){return this._shouldChangeBeHandled(e)},this))&&e.id},this))},_shouldChangeBeHandled:function(e){this._throwNotImplemented()},_processChangesToHandle:function(e,t,n){var i=this._getChangedEntitiesIds(e);r.when(this.dataProvider.getEntitiesDetailsPromise(i,t),this.dataProvider.getDefaultProcessPromise()).then(s.bind(function(t,n){return this._buildEntitiesWithRequirements(t,e,n)},this)).done(s.bind(function(e){this._handleEntitiesRequirements(e,n)},this))},_getChangedEntitiesIds:function(e){return s.map(e,s.bind(function(e){return this._getChangedEntityId(e)},this)).join(",")},_getChangedEntityId:function(e){this._throwNotImplemented()},_buildEntitiesWithRequirements:function(e,t,n){this._throwNotImplemented()},_handleEntitiesRequirements:function(e,t){var n=s.bind(function(e,i){var r=i||0,s=e[r];if(!s)return void t.resolve();var a=this._getEntityRequiredCFs(s);return 0==a.length?void n(++r):void this._requireEntityCFs(s,a).done(function(){n(++r)}).fail(t.reject)},this,e);n()},_requireEntityCFs:function(e,t){var n=new r.Deferred;return this.requireEntityCFsCallback(i({},e,{customFields:t}),n),n.promise()}});e.exports=o},function(e,t,n){"use strict";var i=n(4),r=n(7),s=n(15),a=s.extend({init:function(e,t,n){this._super(e,t,n)},_getInterrupter:function(){return new r},_shouldChangeBeHandled:function(e){return e.name&&"customfields"===e.name.toLowerCase()},_getChangedEntityId:function(e){return e.id},_getCFsChanges:function(e,t){var n=i.find(t,function(t){return t.id==e.id}),r=i.reduce(n.changes,function(e,t){return this._shouldChangeBeHandled(t)?e.concat(t.value):e},[],this);return i.filter(r,function(t){return i.find(e.customFields,function(e){return t.name==e.name&&t.value!=e.value})})}});e.exports=a},function(e,t,n){"use strict";var i=n(6),r=n(4),s=n(13),a=s.extend({init:function(e,t,n){this._super(e,t,n)},_getEntityRequiredCFs:function(e){return this.requirements.getRequiredCFsForCFs(e)},_buildEntitiesWithRequirements:function(e,t,n){var s=i.Deferred(),a=r.map(e,function(e){return{entity:e,processId:this.dataProvider.getEntityProcessId(e,n),requirementsData:{changedCFs:this._getCFsChanges(e,t)}}},this);return s.resolve(a),s.promise()}});e.exports=a},function(e,t,n){"use strict";var i=n(4),r=n(17),s=n(12),a=n(18),o=s.extend({init:function(e,t,n){this._super(e,t,n),this.sliceDecoder=new a},_getInterrupter:function(){return new r},_getChangedEntityId:function(e){return this.sliceDecoder.decode(e.id)},_getNewState:function(e,t,n,r,s){var a=i.find(n,function(t){return parseInt(this.sliceDecoder.decode(t.id))===e.id},this);return this._getEntityState(e,t,a.changes,r,s)},_getEntityState:function(e,t,n,r,s){var a=i.find(n,function(e){return this._shouldChangeBeHandled(e)},this);if(!a)return null;var o=this.sliceDecoder.decode(a.value);return this._isTeamStateChange(a)?this._getTeamState(o,e,t,s):i.find(t,function(t){return t.process.id===this.dataProvider.getEntityProcessId(e,r)&&t.entityType.name===e.entityType.name&&this.isStateEqual(o,t)},this)},_getTeamState:function(e,t,n,r){if(i.isEmpty(t.assignedTeams))return null;var s=i.compact(i.map(t.assignedTeams,function(e){var n=e.team.id,s=i.find(r,function(e){return e.project.id===t.project.id&&e.team.id===n});return s?i.find(s.workflows,function(e){return e.entityType.name===t.entityType.name}).id:null}));return i.find(n,function(t){return this.isProperState(e,t,s)?!0:i.some(t.subEntityStates,function(t){return this.isProperState(e,t,s)}.bind(this))}.bind(this))},isProperState:function(e,t,n){return i.contains(n,t.workflow.id)&&this.isStateEqual(e,t)},isStateEqual:function(e,t){var n=e.toLowerCase();return n===t.name.toLowerCase()||"_initial"===n&&t.isInitial||"_final"===n&&t.isFinal||"_planned"===n&&t.isPlanned}});e.exports=o},function(e,t){e.exports=a},function(e,t){"use strict";var n=function(){};n.prototype={decode:function(e){if(0!==e.indexOf("b64_"))return e;var t=e;return t=t.replace(/_0/g,"+"),t=t.replace(/_1/g,"/"),t=t.replace(/_2/g,"="),t=t.substring(4,t.length-1),this._decodeBase64(t)},_decodeBase64:function(e){var t,n,i={},r=[],s="",a=String.fromCharCode,o=[[65,91],[97,123],[48,58],[43,44],[47,48]];for(n in o)for(t=o[n][0];t<o[n][1];t++)r.push(a(t));for(t=0;64>t;t++)i[r[t]]=t;for(t=0;t<e.length;t+=72){var u,c,d=0,l=0,f=e.substring(t,t+72);for(c=0;c<f.length;c++)for(u=i[f.charAt(c)],d=(d<<6)+u,l+=6;l>=8;)s+=a((d>>>(l-=8))%256)}return s.replace(/[^\w\s]/gi,"")}},e.exports=n},function(e,t,n){"use strict";var i=n(4),r=n(17),s=n(15),a=n(18),o=s.extend({CUSTOM_FIELD_NO_VALUE_STRING:"na",CUSTOM_FIELD_CHANGE_ID_PREFIX_REGEX:/^ddl/,init:function(e,t,n){this._super(e,t,n),this.sliceDecoder=new a},_getInterrupter:function(){return new r},_shouldChangeBeHandled:function(e){return e.name&&this.CUSTOM_FIELD_CHANGE_ID_PREFIX_REGEX.test(e.name.toLowerCase())},_getChangedEntityId:function(e){return this.sliceDecoder.decode(e.id)},_getCFsChanges:function(e,t){var n=i.find(t,function(t){return parseInt(this.sliceDecoder.decode(t.id))===e.id},this),r=i.reduce(n.changes,function(e,t){return this._shouldChangeBeHandled(t)?e.concat({name:this._getCFNameFromChange(t),value:this._getCFValueFromChange(t)}):e},[],this);return i.filter(r,function(t){return i.find(e.customFields,function(e){return t.name.toLowerCase()==e.name.toLowerCase()&&t.value!=e.value})})},_getCFNameFromChange:function(e){return e.name.replace(this.CUSTOM_FIELD_CHANGE_ID_PREFIX_REGEX,"")},_getCFValueFromChange:function(e){var t=this.sliceDecoder.decode(e.value);return t!==this.CUSTOM_FIELD_NO_VALUE_STRING?t:null}});e.exports=o},function(e,t,n){"use strict";var i=n(6),r=n(4),s=n(21),a=n(9),o=n(22),u=n(24),c=n(25),d=a.extend({init:function(e,t){this.requirements=t,this.dataProvider=e,this.cfProcessor=new o(this.requirements),this.stateProcessor=new u(this.requirements),this.cascadeTracker=new c(this.requirements),this.quickAddComponents=[{componentName:"board.cell.quick.add"},{componentName:"board cell quick add"},{componentName:"board axis quick add"},{componentName:"board plus quick add general",doNotWaitSettingsReady:!0},{componentName:"board plus quick add cells"},{componentName:"board general quick add"},{componentName:"entity quick add",doNotWaitSettingsReady:!0}]},subscribe:function(){r.forEach(this.quickAddComponents,function(e){this._subscribeComponent(e)},this)},_subscribeComponent:function(e){var t=new s(e.componentName),n=e.doNotWaitSettingsReady?"":" + settings.ready",i={};i["bus afterInit:last + before_dataBind"+n]=r.bind(this._readyToModifyBindData,this),i["bus afterRender"]=r.bind(this._readyToTrackCascadeCFs,this,t),t.flow(i,this)},_readyToModifyBindData:function(e,t,n,s){e.before_dataBind.suspendMain();var a=t.config.context.configurator;this._getContextPromise(a).done(r.bind(function(o){var u=o.processes,c=r.map(u,function(e){return e.id}),d=r.keys(n.types);i.when(this.dataProvider.getEntityStatesForTypesAndProcessesPromise(a,d,c),this.dataProvider.getCustomFieldsForTypesAndProcessesPromise(a,d,c)).done(r.bind(function(i,r){var a=this._buildRequiredCFsToModify({afterInitEvtArg:t,dataBindEvtArg:n,settingsReadyEvtArg:s},{entityTypes:d,processes:u,customFields:r,entityStates:i});this._modifyBindData(n,a),e.before_dataBind.resumeMain()},this))},this))},_readyToTrackCascadeCFs:function(e,t){this.cascadeTracker.track(t.data.element,function(){e.fire("adjustPosition")})},_getContextPromise:function(e){var t=i.Deferred();return e.getAppStateStore().get({fields:["acid"],callback:r.bind(function(n){e.getApplicationContextService().getApplicationContext({acid:n.acid},{success:r.bind(function(e){t.resolve(e)}),failure:r.bind(function(e){t.reject(e)})})},this)}),t.promise()},_buildRequiredCFsToModify:function(e,t){var n=this.stateProcessor.getChangedValue(e.afterInitEvtArg,e.settingsReadyEvtArg),i=this.cfProcessor.getChangedValue(e.afterInitEvtArg,e.settingsReadyEvtArg),s=[];r.forEach(t.processes,function(a){r.forEach(t.entityTypes,function(o){var u=r.filter(t.customFields,function(e){return e.processId==a.id&&e.entityTypeName.toLowerCase()==o.toLowerCase()});s=s.concat(this.stateProcessor.getCFs(n,t.entityStates,a,o,e.dataBindEvtArg,u)),s=s.concat(this.cfProcessor.getCFs(i,t.entityStates,a,o,e.dataBindEvtArg,u))},this)},this);var a=r.filter(t.customFields,function(e){return e.required}),o=this.cascadeTracker.buildCascadeCFs(s.concat(a),t.customFields);return r.compact(s.concat(o))},_modifyBindData:function(e,t){r.forEach(t,function(t){e.types[t.entityTypeName].template.items.push(this._createCFDataBindConfig(t))},this)},_createCFDataBindConfig:function(e){return{caption:e.name,config:{calculationModel:"",calculationModelContainsCollections:null,defaultValue:"",resourceType:"CustomFieldConfig",units:""},fieldType:e.fieldType,id:"CustomFields",options:e.value?{value:e.value}:{},processId:e.processId,required:!0,type:"CustomField"}}});e.exports=d},function(e,t){e.exports=o},function(e,t,n){"use strict";var i=n(4),r=n(23),s=r.extend({_getAxisValueName:function(){return"ddl"},_getAxisDefaultValue:function(){return null},_getNewAxisValue:function(e,t){return{name:e.substring(3),value:this.sliceDecoder.decode(t)}},_getRequiredCFs:function(e,t,n,r,s){return this.requirements.getRequiredCFsForCFs({entity:{entityType:{name:r},customFields:i.map(s,function(e){return{name:e.name,value:e.config.defaultValue}})},processId:n.id,requirementsData:{changedCFs:[e]}})}});e.exports=s},function(e,t,n){"use strict";var i=n(4),r=(n(7),n(21),n(18)),s=(n(10),n(9)),a=s.extend({init:function(e){this.requirements=e,this.sliceDecoder=new r},getCFs:function(e,t,n,r,s,a){if(!e)return[];var o=this._getRequiredCFs(e,t,n,r,a),u=[];return o.length>0&&i.forEach(o,function(e){var t=i.find(a,function(t){return t.name.toLowerCase()==e.name.toLowerCase()});t.required||u.push(t)},this),u},getChangedValue:function(e,t){var n=this._getSliceDefinition(e);return n&&t?this._getAxisName(e,n,t,"x")||this._getAxisName(e,n,t,"y")||this._getAxisDefaultValue():this._getAxisDefaultValue()},_getRequiredCFs:function(e,t,n,i,r){},_getAxisValueName:function(){},_getAxisDefaultValue:function(){},_getNewAxisValue:function(e,t){},_getAxisName:function(e,t,n,r){var s=this._getAxisValueName();if(t[r]&&!this._compareArrays(t[r].types,n.types)){var a=!Boolean(e.config.options.action),o=void 0,u=void 0;if(a?(u=r,o=i.last(e.config.options.path)||""):e.config.options.action[r]&&(u=i.find(t[r].types,function(e){return 0==e.toLowerCase().indexOf(s)}),o=e.config.options.action[r]),u)return this._getNewAxisValue(u,o)}return null},_getSliceDefinition:function(e){return e.config.options&&e.config.options.slice?e.config.options.slice.config.definition:null},_compareArrays:function(e,t){var n=function(e){return i.map(e,function(e){return e.name.toLowerCase()})},r=n(t);return e.length==t.length&&i.every(e,function(e){return i.contains(r,e.toLowerCase())})}});e.exports=a},function(e,t,n){"use strict";var i=n(4),r=n(23),s=r.extend({init:function(e){this._super(e),this.initialState="_initial",this.finalState="_final",this.plannedState="_planned"},_getRequiredCFs:function(e,t,n,r,s){var a=[],o=this._getState(e,t,n,r);return o&&(a=this.requirements.getRequiredCFsForState({entity:{entityType:{name:r},customFields:i.map(s,function(e){return{name:e.name,value:e.config.defaultValue}})},processId:n.id,requirementsData:{newState:o}})),a},_getState:function(e,t,n,r){return i.find(t,function(t){return(t.isInitial&&e.toLowerCase()==this.initialState||t.isFinal&&e.toLowerCase()==this.finalState||t.isPlanned&&e.toLowerCase()==this.plannedState||t.name.toLowerCase()==e.toLowerCase())&&t.entityType.name.toLowerCase()==r.toLowerCase()&&t.process.id==n.id},this)},_getAxisValueName:function(){return"entitystate"},_getAxisDefaultValue:function(){return this.initialState},_getNewAxisValue:function(e,t){return this.sliceDecoder.decode(t)}});e.exports=s},function(e,t,n){"use strict";var i=n(6),r=n(4),s=n(9),a=n(26),o=s.extend({init:function(e){this._requirements=e,this._cascadeCFConstraintsGraph=null,this._cascadeCFs=[],this._$quickAddElement=null},buildCascadeCFs:function(e,t){this._cascadeCFs=[],this._cascadeCFConstraintsGraph=new a(e,this._requirements.getConfig(),this._mapDefaultValues(t),r.bind(this._cascadeCFChangedHandler,this));var n,i,s,o,u,c,d=this._cascadeCFConstraintsGraph.getVerticesWrapped();for(n in d.processes)for(i in d.processes[n].entityTypes)s=d.processes[n].entityTypes[i].cfs,r.forEach(s,function(r){o=r.getId().toLowerCase(),u=this._isRootCF(e,o,n,i),u||(c=this._findCFDefinition(t,o,n,i),this._cascadeCFs.push(c))},this);return this._cascadeCFs},track:function(e,t){0!==this._cascadeCFs.length&&(this._positionShouldBeAdjustedHandler=t,this._$quickAddElement=e,this._actualizeCascadeCFsElements(),this._bindGraphToCFsChanges(),this._cascadeCFs=[])},_mapDefaultValues:function(e){var t={};return r.forEach(e,function(e){t[e.name]=e.config.defaultValue}),t},_cascadeCFChangedHandler:function(e,t,n){this._toggleCFElement(e,t,n.id,n.value,n.isValid)},_isCF:function(e,t,n,i){return e.name.toLowerCase()===t&&e.processId==n&&e.entityTypeName.toLowerCase()===i.toLowerCase()},_isRootCF:function(e,t,n,i){return!!r.find(e,function(e){return this._isCF(e,t,n,i)},this)},_findCFDefinition:function(e,t,n,i){return r.find(e,function(e){return this._isCF(e,t,n,i)},this)},_toggleCFElement:function(e,t,n,i,r){var s=this._findCFElement(e,t,n);s.val(this._buildCFElementValue(s,i,r)).toggleClass("placeholder",!r).parent().toggle(!!r),this._positionShouldBeAdjustedHandler&&this._positionShouldBeAdjustedHandler()},_findCFElement:function(e,t,n){return this._$quickAddElement?this._$quickAddElement.find(".cf-wrap.cf-process_"+e).find(".tau-required-field-editor").filter('[data-fieldname="'+n+'"]'):i()},_buildCFElementValue:function(e,t,n){return 0!==e.length&&t&&n?"multipleselectionlist"===e.data("fieldtype").toLowerCase()?t.split(","):t:null},_actualizeCascadeCFsElements:function(){var e=this._cascadeCFConstraintsGraph.getVerticesWrapped();r.forEach(this._cascadeCFs,function(t){e.processes[t.processId].entityTypes[t.entityTypeName.toLowerCase()].cfs[t.name].isValid()||this._toggleCFElement(t.processId,t.entityTypeName,t.name)},this)},_getQuickAddFieldValue:function(e){return this._$quickAddElement.find('[data-fieldname="'+e+'"]').find("option:selected").data("option")||{}},_bindGraphToCFsChanges:function(){this._$quickAddElement.on("change",'[data-iscf="true"]',r.bind(function(e){var t=i(e.target),n=t.data("fieldname"),r=this._$quickAddElement.find(".quick-add__entity-items").find("button.tau-active").data("type").toLowerCase(),s="project"===r?this._getQuickAddFieldValue("Process").id:this._getQuickAddFieldValue("Project").processId,a=this._getCFValueFromElement(t);this._cascadeCFConstraintsGraph.setCFValue(s,r,n,a)},this))},_getCFValueFromElement:function(e){var t=e.val();return r.isArray(t)?t.join(","):t}});e.exports=o},function(e,t,n){"use strict";function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var s=function(e,t,n){for(var i=!0;i;){var r=e,s=t,a=n;i=!1,null===r&&(r=Function.prototype);var o=Object.getOwnPropertyDescriptor(r,s);if(void 0!==o){if("value"in o)return o.value;var u=o.get;return void 0===u?void 0:u.call(a)}var c=Object.getPrototypeOf(r);if(null===c)return void 0;e=c,t=s,n=a,i=!0,o=c=void 0}},a=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),o=n(4),u=function(){function e(t,n,i,s){r(this,e),this._cfConstraintsConfig=n,this._onVertexIsValidChangeCallback=s,this._defaultValues=i,this._verticesWrapped=this._buildGraph(t)}return a(e,[{key:"getVerticesWrapped",value:function(){return this._verticesWrapped}},{key:"setCFValue",value:function(e,t,n,i){if(this._verticesWrapped.processes[e]&&this._verticesWrapped.processes[e].entityTypes[t]){var r=this._verticesWrapped.processes[e].entityTypes[t].cfs[n];r&&(r.setValue(i),this._breadthFirstUpdateVertexValidity(r))}}},{key:"_buildGraph",value:function(e){var t=this._buildCFsTree(e),n={processes:{}};for(var i in t)n.processes[i]=this._buildProcessVertexWrapped(t,i,o.bind(this._onVertexIsValidChangeCallback,this,i));return n}},{key:"_buildCFsTree",value:function(e){return o.reduce(e,function(e,t){var n=t.entityTypeName.toLowerCase();return e[t.processId]=e[t.processId]||{},e[t.processId][n]=e[t.processId][n]||{},e[t.processId][n][t.name]=t,e},{})}},{key:"_buildProcessVertexWrapped",value:function(e,t,n){var i={vertex:new c(t,!0),entityTypes:{}},r=o.find(this._cfConstraintsConfig,function(e){return e.processId==t}),s=e[t];for(var a in s){var u=r?r.constraints[a.toLowerCase()]:null,d=this._buildEntityTypeVertexWrapped(s,a,u,o.bind(n,this,a)),p=new l(i.vertex,d.vertex,new f);i.entityTypes[a]=d,i.vertex.getOutEdges().push(p),d.vertex.getInEdges().push(p)}return i}},{key:"_buildEntityTypeVertexWrapped",value:function(e,t,n,i){var r={vertex:new c(t,!0),cfs:{}},s=n?n.customFields||[]:[],a=e[t],o={};for(var u in a){var d=this._buildRootCFVertex(a[u],i),p=new l(r.vertex,d,new f);o[d.getId()]=d,r.vertex.getOutEdges().push(p),d.getInEdges().push(p)}return r.cfs=this._buildCFVertices(o,s,i),r}},{key:"_buildRootCFVertex",value:function(e,t){return new d(e.name,!0,t,e.config.defaultValue)}},{key:"_buildCFVertices",value:function(e,t,n){var i=o.extend({},e);if(o.isEmpty(i))return i;for(var r,s=o.map(i,function(e){return e.getId()}),a=s.shift();a;){var u=this._getVertexConstraintsFiltered(t,a),c=i[a];o.forEach(u,function(e){o.forEach(e.requiredCustomFields,function(t){var a=this._getOrCreateOutVertex(i,t,n),o=this._createEdgeValidityConstraint(e),u=new l(c,a,o);this._ensureOutVertexActualValidity(a,u),c.getOutEdges().push(u),a.getInEdges().push(u),r=a.getId(),i[r]||(i[r]=a,s.push(r))},this)},this),a=s.shift()}return i}},{key:"_getVertexConstraintsFiltered",value:function(e,t){return o.filter(e,o.bind(function(e,t){return t.name.toLowerCase()===e.toLowerCase()},this,t))}},{key:"_getOrCreateOutVertex",value:function(e,t,n){var i=this._defaultValues[t]||null;return e[t]||new d(t,!1,n,i)}},{key:"_createEdgeValidityConstraint",value:function(e){return e.valueIn?new h(e.valueIn):new g(e.valueNotIn)}},{key:"_ensureOutVertexActualValidity",value:function(e,t){!e.isValid()&&t.isValid()&&e.setIsValid(!0)}},{key:"_breadthFirstUpdateVertexValidity",value:function(e){var t=e.getOutEdges().slice();if(0!==t.length){var n,i,r,s,a=t.shift(),o={};for(o[e.getId()]=e;a;)n=a.getOutVertex(),i=n.getId(),o[i]||(o[i]=n,r=n.isValid(),s=n.isValidByEdges(),r!==s&&(n.setIsValid(s),Array.prototype.push.apply(t,n.getOutEdges()))),a=t.shift()}}}]),e}(),c=function(){function e(t,n){r(this,e),this._id=t,this._isValid=n,this._inEdges=[],this._outEdges=[]}return a(e,[{key:"getId",value:function(){return this._id}},{key:"isValid",value:function(){return this._isValid}},{key:"isValidByEdges",value:function(){return!!o.find(this._inEdges,function(e){return e.isValid()})}},{key:"setIsValid",
value:function(e){this._isValid=e}},{key:"getInEdges",value:function(){return this._inEdges}},{key:"getOutEdges",value:function(){return this._outEdges}}]),e}(),d=function(e){function t(e,n,i,a){r(this,t),s(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,e,n,i),this._onIsValidChange=i,this._value=a}return i(t,e),a(t,[{key:"setIsValid",value:function(e){s(Object.getPrototypeOf(t.prototype),"setIsValid",this).call(this,e),this._onIsValidChange({id:this._id,isValid:this._isValid,value:this._value})}},{key:"getValue",value:function(){return this._value}},{key:"setValue",value:function(e){this._value=e}}]),t}(c),l=function(){function e(t,n,i){r(this,e),this._inVertex=t,this._outWertex=n,this._validityConstraint=i}return a(e,[{key:"getInVertex",value:function(){return this._inVertex}},{key:"getOutVertex",value:function(){return this._outWertex}},{key:"isValid",value:function(){return this._validityConstraint.isValid(this)}}]),e}(),f=function(){function e(){r(this,e)}return a(e,[{key:"isValid",value:function(e){return e.getInVertex().isValid()}}]),e}(),p=function(e){function t(e){r(this,t),s(Object.getPrototypeOf(t.prototype),"constructor",this).call(this),this._inVertexValues=e}return i(t,e),a(t,[{key:"_hasValue",value:function(e){for(var t=0,n=this._inVertexValues.length;n>t;t++){var i=this._inVertexValues[t];if(!i&&!e||i==e)return!0}return!1}}]),t}(f),h=function(e){function t(e){r(this,t),s(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,e)}return i(t,e),a(t,[{key:"isValid",value:function(e){return s(Object.getPrototypeOf(t.prototype),"isValid",this).call(this,e)&&this._hasValue(e.getInVertex().getValue())}}]),t}(p),g=function(e){function t(e){r(this,t),s(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,e)}return i(t,e),a(t,[{key:"isValid",value:function(e){return s(Object.getPrototypeOf(t.prototype),"isValid",this).call(this,e)&&!this._hasValue(e.getInVertex().getValue())}}]),t}(p);e.exports=u},,function(e,t){e.exports=u},function(e,t){e.exports=c},function(e,t){e.exports=d},function(e,t){e.exports=l},,function(e,t){e.exports=f},,function(e,t){e.exports=p},function(e,t){e.exports=h},,function(e,t){e.exports=g},function(e,t){e.exports=m},function(e,t){e.exports=y},,,function(e,t){e.exports=v},,function(e,t){e.exports=_},,,,,function(e,t){e.exports=C},,,,,,function(e,t){e.exports=F},,,,,,,,function(e,t){e.exports=w},,,,,,,,function(e,t){e.exports=E}])})}();