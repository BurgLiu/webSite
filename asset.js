
var mode  = "lent";          //lent:表示借出,borrow:表示接入
var operate = "";               //操作包括:create,delete,update
var selectedIndexTable = new  Array();
var lent_history = new Array();
var borrow_history = new Array();

var attrList = ['整机','PCB','其他'];
var statusList = ['CNC','试模','试产','首量','量产','成品'];
 //YYYY-mm-dd 正则
var dateRegExp = /(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)/;


$(document).ready(function(){

/**************************************************************************
//配置方法见:http://vitalets.github.io/x-editable/docs.html
***************************************************************************/
    $.fn.editable.defaults.mode  = 'inline';
    $.fn.editable.defaults.disabled  = true;
    $.fn.editable.defaults.emptytext =  'null'; //不能修改为“”,否则无法编辑
    $.fn.editable.defaults.defaultValue = '';

    showTable("#lent");
    $("#lent_nav").addClass('itemSelected');

    $("#lent_time").datepicker({dateFormat: "yy-mm-dd"});
    $("#return_time").datepicker({dateFormat: "yy-mm-dd"});

    //导入数据dialog
    $( "#dialogImport" ).dialog({
      autoOpen: false,
      show: {
        effect: "blind",
        duration: 1000
      },
      hide: {
        effect: "explode",
        duration: 1000
      },
    });

    //进入借出功能
    $("#lent_nav").click(function(){
        mode = "lent";
        showTable("#lent");
        $("#lent_nav").addClass('itemSelected');
        $("#borrow_nav").removeClass('itemSelected');
        $("#modalName").text("借机人");
        $("#modalTime").text("借出时间");
        selectedIndexTable.splice(0,selectedIndexTable.length);
    });

    //进入借入功能
    $("#borrow_nav").click(function(){
        mode = "borrow";
        showTable("#borrow");
        $("#borrow_nav").addClass('itemSelected');
        $("#lent_nav").removeClass('itemSelected');
        $("#modalName").text("姓名");
        $("#modalTime").text("借入时间");
        selectedIndexTable.splice(0,selectedIndexTable.length);
    });

    //增加
    $("#btn_add").click(function() {
        $("#myModal").modal({
            show:true,
            keyboard:true
        });
    });

    //编辑
    $('#btn_edit').click(function(){
        $('#btn_edit').toggleClass('btn-primary');
        $.fn.editable.defaults.disabled = ! $.fn.editable.defaults.disabled;
        $('#lent').bootstrapTable('refresh');
        $('#borrow').bootstrapTable('refresh'); 
        selectedIndexTable.splice(0,selectedIndexTable.length);

    });

    //删除
    $("#btn_delete").click(function(){
        operate = "delete";

        $.ajax({
            url:'operate/'+ mode + "/" + operate + "/?rand=" +  Math.random(),
            method:'POST',
            dataType: 'json',
            traditional:true,               //用于传输数组
            data:{list:selectedIndexTable},
            async:false,
            success:function(xhr){
                if(mode == "lent"){
                    $('#lent').bootstrapTable('remove',{
                        field:'index',
                        values:selectedIndexTable
                    });
                }else {
                    $('#borrow').bootstrapTable('remove',{
                        field:'index',
                        values:selectedIndexTable
                    });
                }

                selectedIndexTable.splice(0,selectedIndexTable.length);
            },
            error:function(xhr) {
                alert("error:" + xhr.status + xhr.statusText);
                alert(xhr.responseText);
            },
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        })
    });



    //提交数据
    $("#submit_data").click(function(){
        operate = "create";

       
        var attr = $("#modal_attr").val().trim();
        var code = $("#modal_code").val().trim();
        var person = $("#modal_person").val().trim();
        var lent_time = $("#lent_time").val().trim();
        var name = $("#modal_name").val().trim();
        var status = $("#modal_status").val().trim();
        var quantity = $("#modal_quantity").val().trim();
        var return_time = $("#return_time").val().trim();
        var addition = $("#addition").val().trim();

        if((lent_time.length != 0)&&(!(dateRegExp.test(lent_time)))){
            alert('time format should be [YYYY-mm-dd]');
            return;
        }
        if((return_time.length != 0)&&(!(dateRegExp.test(return_time)))){
            alert('time format should be [YYYY-mm-dd]');
            return;
        }
        if(quantity === ""){
            quantity = 1;
        }
        if((quantity==0) || (Math.floor(quantity) != quantity)){
            alert('quantity should be  a  Integer number!');
            return;
        }

        var submit_data = {
            //"operate":'creat',
            //"mode":mode,
            "attr":attr,
            "code":code,
            "person":person,
            "time_lent":lent_time,
            "time_borrow":lent_time,                    //borrow和lent公用
            "name":name,
            "status":status,
            "quantity":quantity,
            "time_return":return_time,
            "addition":addition
        }
        var csrftoken = getCookie('csrftoken');
        $.ajax({
            url: 'operate/'+ mode + "/" + operate + "/?rand=" +  Math.random(),
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(submit_data),
            async:false,
            success:function(res){
                $('#myModal').modal('hide');
                submit_data.index = res;
                submit_data.operate = operate;
                if(mode == "lent"){
                    lent_history.push(submit_data);
                    $('#lent').bootstrapTable('append',submit_data);
                }
                else if (mode == "borrow") {
                    borrow_history.push(submit_data);
                    $('#borrow').bootstrapTable('append',submit_data);
                }
            },
            error:function(xhr) {
                alert("error:" + xhr.status + xhr.statusText);
                alert(xhr.responseText);
            },
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }


        });
    });

    //撤销

    //退出登陆
    $("#logout").click(function(){
        $("#modeforlogout").modal({
            show:true,
            keyboard:true
        });
    });

    //导入数据
    $("#import").click(function(){
        $( "#dialogImport" ).dialog( "open" );
    });
    $("#importData").change(function(){
        var file_info =$( '#importData')[0].files[0];
        var form_data = new FormData();
        form_data.append('file',file_info);

        $.ajax({
            type: "POST",
            url:"import/",
            data:form_data,
            processData: false,  // tell jquery not to process the data
            contentType: false, // tell jquery not to set contentType
            success: function (res, status) {
                if(res != "OK"){
                    alert(res)
                }
                if (status == "success") {
                    $('#lent').bootstrapTable('refresh');
                    $('#borrow').bootstrapTable('refresh');
                    $( "#dialogImport" ).dialog("close");
                }
            },
            error: function (xhr) {
                alert("Error");
            },
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });
    });


    //查看
    $("#find").click(function(){
        loadFindTable();
        $("#modeforsearch").modal({
            show:true,
            keyboard:true,
        });
    });

});



//初始化表格
function loadLentTable(){
	$('#lent').bootstrapTable('destroy');
    $("#lent").bootstrapTable({
        /*
        detail config:       http://bootstrap-table.wenzhixin.net.cn/zh-cn/documentation/
        */

        method:'get',                          //服务器数据的请求方式 'get' or 'post' 
        url:'lent/?rand=' + Math.random(),
        sidePagination: "client",               //分页方式:"server" , "client"
        dataType:'json',                        //服务器返回的数据类型

        cache:false,                            //设置为 false 禁用 AJAX 数据缓存
        //contentType:"application/x-www-form-urlencoded",        //发送到服务器的数据编码类型
        //contentType:'application/json',
        //queryParams:queryParams,

        pagination:true,                        //是否分页
        pageNumber:1,                           //首页页码
        pageSize:10,                            //页面数据条数
        pageList:"[10, 25, 50, 100, All]",        //设置可供选择的页面数据条数

        showRefresh:true,                       //是否显示 刷新按钮
        showPaginationSwitch:true,              //是否显示 数据条数选择框
        toolbar: '#toolbar',                    //工具按钮用哪个容器
        //iconsPrefix:'fa',                       //使用FontAwesome字体图标

        showRefresh:true,                       //是否刷新    
        search:true,                            //是否启用搜索框
        showPaginationSwitch:true,              //是否显示 数据条数选择框
        showToggle:true,                        //table 和 card视图切换

        paginationPreText:"<",              //上一页说明
        paginationNextText:">",              //下一页说明
        showExport:true,
        //clickEdit:true,
        exportDataType:'all',               //默认basic：只导出当前页的表格数据；all：导出所有数据；selected：导出选中的数据
        //striped:true,

       // data:getData,
       //mode:'inline',

        columns:[
        {
            field:'index',
            title:'序号',
            align:"center",
            halign:"center",
            visible:false
        },
        {
            field:'attr',
            title:'属性',
            sortable:true,
            align:"center",
            halign:"center",
            editable:{
                mode:'inline',
                type:'select',
                title:'属性',
                //source:[{text:"整机"},{text:"PCB"},{text:"其他"}],
                source:attrList,
                noeditFormatter: function (value,row,index) {
                    var result={
                        filed:"attr",
                        value:value,
                       // class:"badge",
                        //style:"background:#333;padding:5px 10px;"
                    };
                    return result;
                }
            }

        },
        {
            field:'name',
            title:'机型名称',
            align:"center",
            halign:"center",
            sortable:true,
            editable:{
                type:'text',
                title:'机型名称',
            }
        },
        {
            field:'status',
            title:'机器状态',
            align:"center",
            halign:"center",
            sortable:true,
            editable:{
                type:"select",
                title:'机器状态',
                source:statusList,
                //source:[{text:'CNC'},{text:'试模'},{text:'试产'},{text:'首量'},{text:'量产'},{text:'成品'}],
                noeditFormatter: function (value,row,index) {
                    var result={
                        filed:"status",
                        value:value,
                    };
                    return result;
                }
            }
        },
        {
            field:'code',
            title:'编码',
            sortable:true,
            align:"center",
            halign:"center",
            editable:{
                type:'text',
                title:'机型名称',
            }
        },
        {
            field:'person',
            title:'借机人',
            align:"center",
            halign:"center",            
            editable:{
                type:'text',
                title:'借机人姓名',
            }
        },
        {
            field:'time_lent',
            title:'借出时间',
            sortable:true,
            align:"center",
            halign:"center",
            formater:function(value,row,index){
                //return value?value:'-/-/-';
            },
            editable:{
                type:'date',
                title:'借出时间',
                format:'yyyy-mm-dd',
                //mode:'popup',
            }
        },
        {
            field:'time_return',
            title:'归还时间',
            sortable:true,
            align:"center",
            halign:"center",            
            editable:{
                type:'date',
                title:'归还时间',
                format:'yyyy-mm-dd',
                //mode:'popup'
            }
        },
        {
            field:'quantity',
            title:'数量',
            sortable:true, 
            align:"center",
            halign:"center",
            editable:{
                type:'text',
                title:"数量"
            }
        },
        {
            field:'addition',
            title:'备注',
            halign:"center",
			//width:10%,
            editable:{
                type:'textarea',
                title:'备注信息',               
                noeditFormatter: function (value,row,index) {
                    var result={
                        filed:"addition",
                        value:value,
                    };
                    return result;
                }
           }
        }
        ],
        onLoadSuccess:function(response){
            var data = JSON.parse(response);
            var res = new Array();
            for(var i=0;i<data.length;i++){
                data[i].fields.index = data[i].pk;             //获取ID
                res.push(data[i].fields);
            }
            
            $("#lent").bootstrapTable("load",res);      
        },
        onClickRow:function(row,$element){
            if(! $.fn.editable.defaults.disabled){
                return;
            }
            $element.toggleClass('deleteItem');
            var id = row.index;
            for(var i = 0;i<selectedIndexTable.length;i++){
                if(selectedIndexTable[i] == id){
                    selectedIndexTable.splice(i, 1);            //删除存在的数据
                    return;
                }
            }
            selectedIndexTable.push(id);
        },
        onEditableSave: function (field, row, oldValue, $el) {
            if((field == 'time_lent' )|| (field == "time_return")){
                //row[field] = row[field].replace("/","-")   //如果是:yyyy/mm/dd
                if((row[field].length !=0) && (!dateRegExp.test(row[field]))){
                    alert('time format should be [YYYY-mm-dd]');
                    return;
                }
               // var dt = row[field].split("-");
               // row[field] = dt[0].trim() + "-" +(dt[1].trim().length>1?dt[1].trim():("0" + dt[1].trim())) +"-" +  (dt[2].trim().length>1?dt[2].trim():("0" + dt[2].trim()))
            }
            if(field == "quantity"){
                if(row[field] === ""){
                    alert("quantity must be a integer");
                    return;
                }
                if(Math.floor(row[field]) != row[field]){
                    alert('quantity should be  a  Integer number!');
                    return;
                }
            }
            operate = "update";
            var data = {
                'index':row['index'],
                'oldValue':oldValue,
                'field':field,
                'newValue':row[field],
                //'row':row,
            }
            $.ajax({
                type: "post",
                url:'operate/'+ mode + "/" + operate + "/?rand=" +  Math.random(),
                data:JSON.stringify(data),
                success: function (res, status) {
                    if (status == "success") {
                        data.operate = operate;
                        lent_history.push(data);
                        $('#lent').bootstrapTable('refresh');
                    }
                },
                error: function (xhr) {
                    alert("Error");
                    $('#lent').bootstrapTable('refresh');
                },
                beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }


            });
        },
    });
}

function loadBorrowTable(){
    $('#borrow').bootstrapTable('destroy');
    $("#borrow").bootstrapTable({
        /*
        detail config:       http://bootstrap-table.wenzhixin.net.cn/zh-cn/documentation/
        */

        method:'get',                          //服务器数据的请求方式 'get' or 'post' 
        url:'borrow/?rand=' + Math.random(),
        sidePagination: "client",               //分页方式:"server" , "client"
        dataType:'json',                        //服务器返回的数据类型

        cache:false,                            //设置为 false 禁用 AJAX 数据缓存
        //contentType:"application/x-www-form-urlencoded",        //发送到服务器的数据编码类型
        //contentType:'application/json',
        //queryParams:queryParams,

        pagination:true,                        //是否分页
        pageNumber:1,                           //首页页码
        pageSize:10,                            //页面数据条数
        pageList:"[10, 25, 50, 100, All]",        //设置可供选择的页面数据条数

        showRefresh:true,                       //是否显示 刷新按钮
        showPaginationSwitch:true,              //是否显示 数据条数选择框
        toolbar: '#toolbar',                    //工具按钮用哪个容器
        //iconsPrefix:'fa',                       //使用FontAwesome字体图标

        showRefresh:true,                       //是否刷新    
        search:true,                            //是否启用搜索框
        showPaginationSwitch:true,              //是否显示 数据条数选择框
        showToggle:true,                        //table 和 card视图切换

        paginationPreText:"<",              //上一页说明
        paginationNextText:">",              //下一页说明
        showExport:true,
        exportDataType:'all',               //默认basic：只导出当前页的表格数据；all：导出所有数据；selected：导出选中的数据
        //striped:true,

        columns:[
        {
            field:'index',
            title:'序号',
            align:"center",
            halign:"center",
            visible:false
        },
        {
            field:'attr',
            title:'属性',
            sortable:true,
            align:"center",
            halign:"center",
            editable:{
                mode:'inline',
                type:'select',
                title:'属性',
                //source:[{text:"整机"},{text:"PCB"},{text:"其他"}],
                source:attrList,
                noeditFormatter: function (value,row,index) {
                    var result={
                        filed:"attr",
                        value:value,
                       // class:"badge",
                        //style:"background:#333;padding:5px 10px;"
                    };
                    return result;
                }
            }
        },
        {
            field:'name',
            title:'机型名称',
            align:"center",
            halign:"center",
            sortable:true,
            editable:{
                type:'text',
                title:'机型名称',
            }
        },
        {
            field:'status',
            title:'机器状态',
            align:"center",
            halign:"center",
            sortable:true,
            editable:{
                type:"select",
                title:'机器状态',
                //source:[{text:'CNC'},{text:'试模'},{text:'试产'},{text:'首量'},{text:'量产'},{text:'成品'}],
                //source:["CNC",'试模','试产','首量','量产','成品'],
                source:statusList,
                noeditFormatter: function (value,row,index) {
                    var result={
                        filed:"status",
                        value:value,
                    };
                    return result;
                }
            }
        },
        {
            field:'code',
            title:'编码',
            sortable:true,
            align:"center",
            halign:"center",
            editable:{
                type:'text',
                title:'机型名称',
            }
        },
        {
            field:'person',
            title:'姓名',
            align:"center",
            halign:"center",
            editable:{
                type:'text',
                title:'姓名',
            }
        },
        {
            field:'time_borrow',
            title:'借入时间',
            sortable:true,
            align:"center",
            halign:"center",
            editable:{
                type:'date',
                title:'借入时间',
                format:'yyyy-mm-dd',
                //mode:'popup',
            }
        },
        {
            field:'time_return',
            title:'归还时间',
            sortable:true,
            align:"center",
            halign:"center",
            editable:{
                type:'date',
                title:'归还时间',
                format:'yyyy-mm-dd',
               // mode:'popup',
            }
        },
        {
            field:'quantity',
            title:'数量',
            sortable:true, 
            align:"center",
            halign:"center",
            editable:{
                type:'text',
                title:"数量"
            }
        },
        {
            field:'addition',
            title:'备注',
            halign:"center",
			//width:10%,
            editable:{
                type:'textarea',
                title:'备注信息',           
                noeditFormatter: function (value,row,index) {
                    var result={
                        filed:"addition",
                        value:value,
                    };
                    return result;
                }
           }
        }
        ],
        onLoadSuccess:function(response){
            var data = JSON.parse(response);
            var res = new Array();
            for(var i=0;i<data.length;i++){
                data[i].fields.index = data[i].pk;             //获取ID
                res.push(data[i].fields);
            }
            
            $("#borrow").bootstrapTable("load",res);      
        },
        onClickRow:function(row,$element){
            if(! $.fn.editable.defaults.disabled){
                return;
            }
            $element.toggleClass('deleteItem');
            var id = row.index;
            for(var i = 0;i<selectedIndexTable.length;i++){
                if(selectedIndexTable[i] == id){
                    selectedIndexTable.splice(i, 1);            //删除存在的数据
                    return;
                }
            }
            selectedIndexTable.push(id);
        },
        onEditableSave: function (field, row, oldValue, $el) {
            if((field == 'time_borrow' )|| (field == "time_return")){
                if((row[field].length !=0) && (!dateRegExp.test(row[field]))){
                    alert('time format should be [YYYY-mm-dd]');
                    return;
                }
                //var dt = row[field].split("-");
                //row[field] = dt[0].trim() +"-"+ (dt[1].trim().length>1?dt[1].trim():("0" + dt[1].trim())) + "-" + (dt[2].trim().length>1?dt[2].trim():("0" + dt[2].trim()))
            }
            if(field == "quantity"){
                if(row[field] === ""){
                    alert("quantity must be a integer");
                    return;
                }
                if(Math.floor(row[field]) != row[field]){
                    alert('quantity should be  a  Integer number!');
                    return;
                }
            }
            operate = "update";
            var data = {
                'index':row['index'],
                'oldValue':oldValue,
                'field':field,
                'newValue':row[field],
                //'row':row
            }
            $.ajax({
                type: "post",
                url:'operate/'+ mode + "/" + operate + "/?rand=" +  Math.random(),
                data:JSON.stringify(data),
                success: function (res, status) {
                    if (status == "success") {
                        data.operate = operate;
                        borrow_history.push(data);
                        $('#borrow').bootstrapTable('refresh');
                    }
                },
                error: function (xhr) {
                    alert('Error');
                },
                beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }

            });
        }
        
    });
}

function loadFindTable(){
    $('#findTable').bootstrapTable('destroy');
    $("#findTable").bootstrapTable({
        method:'get',
        url:'find/?rand=' + Math.random(),
        sidePagination: "client",               //分页方式:"server" , "client"
        dataType:'json',                        //服务器返回的数据类型

        cache:false,                            //设置为 false 禁用 AJAX 数据缓存
        pagination:true,                        //是否分页
        pageNumber:1,                           //首页页码
        pageSize:10,                            //页面数据条数
        showRefresh:true,                       //是否显示 刷新按钮
        //showPaginationSwitch:true,              //是否显示 数据条数选择框
        //toolbar: '#toolbar',                    //工具按钮用哪个容器
        //iconsPrefix:'fa',                       //使用FontAwesome字体图标

        search:true,                            //是否启用搜索框
        showToggle:true,                        //table 和 card视图切换
        columns:[
        {
            field:'id',
            title:'序号',
            align:"center",
            halign:"center",
            visible:false
        },
        {
            field:'user',
            title:'拥有者',
            align:"center",
            halign:"center",
            visible:true,
            sortable:true,
        },
        {
            field:'name',
            title:'机型名称',
            align:"center",
            halign:"center",
            visible:true,
            sortable:true,
        },
        {
            field:'status',
            title:'状态',
            align:"center",
            halign:"center",
            visible:true,
            sortable:true,
        },
        {
            field:'code',
            title:'编码',
            align:"center",
            halign:"center",
            visible:true
        },
        {
            field:'quantity',
            title:'数量',
            align:"center",
            halign:"center",
            visible:true
        },

        ],

        onLoadSuccess:function(response){
            $("#findTable").bootstrapTable("load",response);      
        },

    });
};
// 清除两边的空格 
String.prototype.trim = function ()
{
    return this.replace(/(^\s*)|(\s*$)/g, '');
};

//切换显示表格
function showTable(tbName){
    if(tbName === '#borrow'){
        $("#lent").bootstrapTable("destroy");
        $("#lent").hide();
        $("#borrow").show();
        $("#subject").text("借机记录表[借入]");
        loadBorrowTable();
    }
    else if (tbName === '#lent') {
        $("#borrow").bootstrapTable("destroy");
        $("#borrow").hide();
        $("#lent").show();
        $("#subject").text("借机记录表[借出]");
        loadLentTable();
    }else if (tbName === "none") {
        $("#lent").bootstrapTable("destroy");
        $("#lent").hide();

        $("#borrow").bootstrapTable("destroy");
        $("#borrow").hide();

    }
}

// using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

//撤销
function withdraw(mode){
    var info = '';
    if(mode == 'lent'){
        info = lent_history.pop();

    }else if(mode == 'borrow'){
        info = borrow_history.pop();
    }

    if(info.operate == 'update'){           //更新
        var tmp = info.newValue;
        info.newValue = info.oldValue;
        info.oldValue = tmp;
        $.ajax({
            type: "post",
            url:'operate/'+ mode + "/" + "operate" + "/?rand=" +  Math.random(),
            data:JSON.stringify(info),
            success: function (res, status) {
                if (status == "success") {
                    $('#borrow').bootstrapTable('refresh');
                }
            },
            error: function (xhr) {
                alert('Error');
            },
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });
    }else if(info.operate == 'create'){     //新增
        $.ajax({
            url:'operate/'+ mode + "/" + 'delete' + "/?rand=" +  Math.random(),
            method:'POST',
            dataType: 'json',
            traditional:true,               //用于传输数组
            data:{list:[info.index]},
            async:false,
            success:function(xhr){
                if(mode == "lent"){
                    $('#lent').bootstrapTable('remove',{
                        field:'index',
                        values:info.index
                    });
                }else {
                    $('#borrow').bootstrapTable('remove',{
                        field:'index',
                        values:info.index
                    });
                }
            },
            error:function(xhr) {
                alert("error:" + xhr.status + xhr.statusText);
                alert(xhr.responseText);
            },
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });
    }else if(info.operate == 'delete'){     //删除

    }     
}