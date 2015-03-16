//Ext.override(Ext.Viewport, {
//    initComponent : function() {
//        Ext.Viewport.superclass.initComponent.call(this);
//        this.el = Ext.get(this.el) || Ext.getBody();
//        if (this.el.dom === document.body) {
//            this.el.dom.parentNode.className += ' x-viewport';
//        }
//        this.el.setHeight = Ext.emptyFn;
//        this.el.setWidth = Ext.emptyFn;
//        this.el.setSize = Ext.emptyFn;
//        this.el.dom.scroll = 'no';
//        this.allowDomMove = false;
//        this.autoWidth = true;
//        this.autoHeight = true;
//        Ext.EventManager.onWindowResize(this.fireResize, this);
//        this.renderTo = this.el;
//    }
//});


var mapPanel;
var arrKeywords= new Array();
var arrbegindatetime= new Array();
var arrenddatetime= new Array();

Ext.onReady(function() {    
    var isNewSearch=true;
    var options, layer;
    var extent = new OpenLayers.Bounds(-5, 35, 15, 55);
 
    layer = new OpenLayers.Layer.WMS(
        "Global Imagery",
        "http://maps.opengeo.org/geowebcache/service/wms",
        {
            layers: "bluemarble"
        },

        {
            isBaseLayer: true
        }
        );
    
    var map = new OpenLayers.Map(options);
          
    var polygonLayer = new OpenLayers.Layer.Vector("Polygon Layer");
    map.addLayers([layer, polygonLayer]);
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.addControl(new OpenLayers.Control.MousePosition());
    
 
    polygonLayer.events.on({
        featuresadded: function (event) {
		    if(Ext.getCmp('Search').getText()=='Filter'){
                    alert("Filter does not support Bounding Box.Please reset the filter mode \nwith Reset Button to search with Bounding Box.");
					form.getForm().findField('txtWest').reset();   //minx
					form.getForm().findField('txtSouth').reset(); //miny
					form.getForm().findField('txtEast').reset(); //maxx
					form.getForm().findField('txtNorth').reset();//maxy
                    polygonLayer.removeAllFeatures();
                    return;
            }
            var bounds=event.features[0].layer.getDataExtent();
            form.getForm().findField('txtNorth').setValue(bounds.top);
            form.getForm().findField('txtSouth').setValue(bounds.bottom);
            form.getForm().findField('txtWest').setValue(bounds.left);
            form.getForm().findField('txtEast').setValue(bounds.right);         
        },        
        sketchstarted:function(event){
            polygonLayer.removeAllFeatures();
        }
    });
    
    var drawControl=new OpenLayers.Control.DrawFeature
    (
        polygonLayer,
        OpenLayers.Handler.RegularPolygon,
        {
 
            handlerOptions:{
                sides: 4,
                irregular: true
            }                             

        }
        );  
            
    map.addControl(drawControl);
 
    drawControl.activate();    
   
   
   
    var bodystyle='padding:3px 10px 0 5px';
    var form = new Ext.form.FormPanel({        
        monitorValid:true,
        autoScroll:true,
        defaults:{
            anchor:'0'
        },
        baseCls: 'x-search',        
        id: 'searchpanel',
        frame:true,           
        items:[
        {
            xtype:'fieldset',
            defaults:{
                anchor:'0'
            },
            bodyStyle: bodystyle,
            items:[{
                xtype:'textfield',
                fieldLabel: 'Enter Keyword',
                name: 'txtKeyword'              
            }
            ]
        }
        ,{          
            xtype:'fieldset',
            defaults:{
                anchor:'0'
            },
            layout: 'form',
            title: 'Select Spatial Range',
            defaultType: 'textfield',
            bodyStyle: bodystyle,
            items:[{
                fieldLabel: 'North',
                name: 'txtNorth' 
            },
            {
                fieldLabel: 'West',
                name: 'txtWest'
            },{
                fieldLabel: 'South',
                name: 'txtSouth'
            },{
                fieldLabel: 'East',
                name: 'txtEast'
            }]
        },
        {
            xtype:'fieldset',
            defaults:{
                anchor:'0'
            },
            layout: 'form',
            title: 'Select Temporal Range',
            defaultType: 'textfield',
            bodyStyle: bodystyle,
            items:[
            {
                xtype:'datefield',
                fieldLabel: 'Begin Date',
                name: 'begin_date',		
                format:'Y-m-d'
            },
            {
                xtype:'timefield',
                fieldLabel: 'Begin Time',
                name: 'begin_time',
                increment:5,
                format:'H:i'
            },
            {
                xtype:'datefield',
                fieldLabel: 'End Date',
                name: 'end_date',		
                format:'Y-m-d'
            },
            {
                xtype:'timefield',
                fieldLabel: 'End Time',
                name: 'end_time',
                increment:5,
                format:'H:i'
            },
            ]   
        }, 
        {
            xtype:'fieldset',            
            layout: 'form',
            title: 'Select Data Type',          
            bodyStyle: bodystyle,
            allowBlank:false,
            items:[
            {
                xtype: 'checkboxgroup',                
                columns: 2,             
                vertical: true,
                allowBlank:false,
                itemCls: 'removefieldlabel',
                width:200,
                items: [
                {                   
                    boxLabel: 'Models', 
                    name: 'chkmodels', 
                    checked: true
                },
                {                    
                    boxLabel: 'Observations', 
                    name: 'chkobservations',                     
                    checked: true
                }]
            }
            ]   
        },
        {
            buttons: [{
                text: 'Search',
                id:'Search',
                handler:fn_submitForm
            },{
                text: 'Reset',
                handler:fn_resetForm
            },
              {
                text: 'Clear Filter',
                handler:fn_ClearFilterForm
            }]
        }]
       
    });
    
    // alert(getRequestBoundingBox(west,south,east,north));       
              
    var isoreader = new GeoExt.data.CSWRecordsReader({
        fields:[                           
        {
            name:'Title',
            mapping:'identificationInfo/MD_DataIdentification/citation/CI_Citation/title/CharacterString'
        }, 
    
        {
            name:'west',
            mapping:'identificationInfo/MD_DataIdentification/extent/EX_Extent/geographicElement/EX_GeographicBoundingBox/westBoundLongitude/Decimal'
        },
    
        {
            name:'east',
            mapping:'identificationInfo/MD_DataIdentification/extent/EX_Extent/geographicElement/EX_GeographicBoundingBox/eastBoundLongitude/Decimal'
        },
    
        {
            name:'south',
            mapping:'identificationInfo/MD_DataIdentification/extent/EX_Extent/geographicElement/EX_GeographicBoundingBox/southBoundLatitude/Decimal'
        },
    
        {
            name:'north',
            mapping:'identificationInfo/MD_DataIdentification/extent/EX_Extent/geographicElement/EX_GeographicBoundingBox/northBoundLatitude/Decimal'
        },
    
        {
            name:'Code',
            mapping:'identificationInfo/MD_DataIdentification/citation/CI_Citation/identifier/MD_Identifier/code/CharacterString'
        },
    
        {
            name:'URL',
            mapping:'distributionInfo/MD_Distribution/distributor/MD_Distributor/distributorTransferOptions/MD_DigitalTransferOptions/onLine/CI_OnlineResource/linkage/URL'
            ,
            convert: function(val, data) {
                if(val==null || val[0]==null)
                    return "";
                else
                    return val[0]['value'];
            }
        },
        {
            name:'Keywords',
            mapping:'identificationInfo/MD_DataIdentification/descriptiveKeywords/MD_Keywords/keyword/CharacterString'
        },    
        {
            name:'Summary',
            mapping:'identificationInfo/MD_DataIdentification/abstract/CharacterString'
        },
        {
            name:'BeginDate',
            mapping:'identificationInfo/MD_DataIdentification/extent/EX_Extent/temporalElement/EX_TemporalExtent/extent/TimePeriod/beginPosition'
        },
        {
            name:'EndDate',
            mapping:'identificationInfo/MD_DataIdentification/extent/EX_Extent/temporalElement/EX_TemporalExtent/extent/TimePeriod/endPosition'
        }
        ]
    });    
    
    var proxysearch = new Ext.data.HttpProxy({
        method: 'GET',
        prettyUrls: false,
        url: 'catalogsearchresponse' // see options parameter for Ext.Ajax.request
    });    
   
    var storesearch = new Ext.data.Store({  
        proxy:proxysearch,
        extraParams:{
            Keywords:'mesh_topology'
        },
        reader: isoreader
    });

    var isoTplMarkup = [
    '<div class="detailtextsmall"><b>Location:</b>{Code}</div>',
    '<div class="detailtextsmall"><b>Keywords:</b>{Keywords}</div>',
    '<div class="detailtextsmall"><b>URL:</b> <a href="{URL}" target="_blank">{URL}</a></div>',
    '<div class="detailtextsmall"><b>Summary:</b>{Summary}</div>',
    '<div class="detailtextsmall"><b>Begin Date:</b>{BeginDate}</div>',
    '<div class="detailtextsmall"><b>End Date:</b>{EndDate}</div>',
    ];
    
    var isoTpl = new Ext.Template(isoTplMarkup);     
   
    // row expander
    var expandersearch =  new Ext.grid.RowExpander({
        tpl : isoTpl
    }); 
    
    var  gridsearch =  new Ext.grid.GridPanel({
        title:'Search Results',
        store: storesearch,
        cm: new Ext.grid.ColumnModel([
            expandersearch,
            new Ext.grid.RowNumberer(),
            {
                id: 'Title',
                header: "Title", 
                dataIndex: "Title", 
                sortable: true,
                flex:1              
            },{
                header: "Geographic Bounding Box", 
                dataIndex: "north", 
                sortable: true,
                //width: 320,
                renderer: function(value, p, r)
                {
                    return 'W : '+r.data['west'] + ', E : ' + r.data['east']+', S :'+r.data['south']+', N :'+r.data['north']
                }
            }
            ]),
        plugins: expandersearch,
        stripeRows: true,
        autoExpandColumn: 'Title',       
        autoHeight: false,
        // width: 600,
        // height:600,
        sm: new Ext.grid.RowSelectionModel({
            singleSelect: true
        }),       
        viewConfig: {
            forceFit: true
        },
        loadMask:true
    }); 
         
    function fn_Action(button,event){ 
        switch(button.text){
            case 'Navigate':
                drawControl.deactivate();
                break;
            case 'Draw Box':
                drawControl.deactivate();
                drawControl.activate();
                break;
        }
    }
    
    
    function fn_ClearFilterForm(button,event){
        arrKeywords=new Array();
        arrbegindatetime=new Array();
        arrenddatetime= new Array();
        storesearch.clearFilter(false);
        clearValue();
    }
    
    function fn_resetForm(button,event){
        isNewSearch=true;
        arrKeywords=new Array();
        arrbegindatetime=new Array();
        arrenddatetime= new Array();       
        setEnableDisable(false);
        clearValue();
        gridsearch.store.removeAll();
		polygonLayer.removeAllFeatures();
        Ext.getCmp('Search').setText('Search');
        
    }
    
    function fn_submitForm(button,event){   
        var iurl='http://testbedapps.sura.org/gi-cat/services/cswiso?';         
        var west =  form.getForm().findField('txtWest').getValue();   //minx
        var south =  form.getForm().findField('txtSouth').getValue(); //miny
        var east =  form.getForm().findField('txtEast').getValue(); //maxx
        var north =  form.getForm().findField('txtNorth').getValue();//maxy
        
        var keyword= form.getForm().findField('txtKeyword').getValue();
            
        
        var begindate= form.getForm().findField('begin_date').getValue();
        var begintime= form.getForm().findField('begin_time').getValue();   
        var enddate= form.getForm().findField('end_date').getValue();
        var endtime= form.getForm().findField('end_time').getValue();
        
        begindatetime =getDateTimeFormat(begindate,begintime);
        enddatetime =getDateTimeFormat(enddate,endtime);
        
 
        
        
        if (enddatetime!=null && begindatetime > enddatetime) {
            alert("Invalid Date Range!\nStart Date cannot be after End Date!")
            return;
        }        
        var isModels =form.getForm().findField('chkmodels').getValue();
        var isObservations =form.getForm().findField('chkobservations').getValue();   
        if(!isModels && !isObservations){
            alert("Please select atleast one Data Type.");
            return;
        }
 
        
         if(keyword!="")
            arrKeywords.push(keyword);   
        
        if(begindatetime!=null)
            arrbegindatetime.push(begindatetime);
        if(enddatetime!=null)
            arrenddatetime.push(enddatetime);
         
        if(isNewSearch){              
            var filterDatatype=getRequestDatatype(isModels,isObservations);
            var filterbbox=getRequestBoundingBox(west,south,east,north);
            var filterTempExtent=getRequestTempExtent(toUTCDateFormat(begindatetime),toUTCDateFormat(enddatetime));
            var filterkeywords=getRequestKeywords(keyword); 
           // alert(getRequestString(filterDatatype,filterbbox,filterTempExtent,filterkeywords));
            storesearch.proxy.conn.url = 'catalogsearchresponse/?isourl='+iurl+'&isodata='+getRequestString(filterDatatype,filterbbox,filterTempExtent,filterkeywords);       
            storesearch.load();
            isNewSearch=false;
            setEnableDisable(true);
            Ext.getCmp('Search').setText('Filter');
        }
        else
        {            
            storesearch.filterBy(
                function(record, id){                     
                    return filterSearchResult(record) 
                }
                );
        }
    }
    
    function filterSearchResult(record){       
        if(arrKeywords.length>0){
            var lowercasekeywords=String(record.get('Keywords')).toLowerCase();
            var keywordSplitResult = lowercasekeywords.split(",");
            var searchkeywords;
            var isEqual;
            for(var i=0;i < arrKeywords.length; i++){  
                searchkeywords=arrKeywords[i].toLowerCase();
                isEqual= false;
                for(var k = 0; k < keywordSplitResult.length; k++){
                    if(keywordSplitResult[k]==searchkeywords){
                        isEqual =true;
                    }
                }
                if(!isEqual)
                    return false;
    
            }
        }
        var rowbegindate=String(record.get('BeginDate'));
        var rowenddate=String(record.get('EndDate'));
        var parsebegindate=getDateTimeFromUTC(rowbegindate);
        var parseenddate=getDateTimeFromUTC(rowenddate);
        
        if(parsebegindate!="" && parseenddate!="")
        {
            for(var i=0;i < arrbegindatetime.length; i++){
                if(arrbegindatetime[i]>parsebegindate)
                    return false;
            }
             for(var i=0;i < arrenddatetime.length; i++){
                if(arrenddatetime[i]<parseenddate)
                    return false;
            }
        }
        else if(parsebegindate!="")
        {
            for(var i=0;i < arrbegindatetime.length; i++){
                if(arrbegindatetime[i]>parsebegindate)
                    return false;
            }
        }
        else if(parseenddate!="")
        {
            for(var i=0;i < arrenddatetime.length; i++){
                if(arrenddatetime[i]<parseenddate)
                    return false;
            }
        }
        else
            return false;
        
        return true;
    }
    
    //convert from UTC '2011-10-30T18:30:45Z' to '2011-10-30 18:30:00' date format
    function getDateTimeFromUTC(str){
        if(str!="")
        {
            str=str.replace(/T|\:\d\dZ/g,' ');  // replace T and Z
            str = str.replace(/^\s+|\s+$/g, '') ;  //trim space
            str=Date.parseDate(str,"Y-m-d H:i");
            return str;
        }
        else
            return "";
    }
    
    new Ext.Viewport({
        layout: "border",
        id:"mapviewport",
 
        items: [
        {
            region: "north",
            contentEl: "header",
            height: 120
        },
        {
            region: "center",
            id: "mappanel",
            title: "Map",
            xtype: "gx_mappanel",
            map: map,                
            tbar: new Ext.Toolbar({               
                items: [{
                    text: 'Navigate',
                    iconCls: 'add16',
                    handler: fn_Action
                },
                {
                    text: 'Draw Box',
                    iconCls: 'add16',
                    handler: fn_Action
                }]
            }),
  
            zoom: 4,
 
            center:[-114,41],
            extent: "-5,35,15,55",
            split: true
        },        
        {
            region: "south",
            contentEl: "footer-message",
            collapsible: true,
            //  width: 50,
            split: true, 
            height:0,
            cmargins: '5 0 0 0'
        },
        {
            region: "west",
            title: "Search Criteria",
         
            collapsible: true,
            layout:'fit',
            width: 310,
 
            widthRatio: 0.20,
            split: true,
            cmargins: '5 0 0 0',
            buttonAlign:'center',
            items:form            
        },
        {
            region: "east",
            title: "Result",
 
            items:[gridsearch],          
            layout:'fit',
            collapsible: true,
            minSize:317,
            width: 400, 
            split: true,
            cmargins: '5 0 0 0'
        }
        ]
    });
    mapPanel = Ext.getCmp("mappanel");     
    
    function getRequestString(filterDatatype,filterbbox,filterTempExtent,filterkeywords){
        
        var allfilter="";
        if(filterDatatype!="" || filterbbox!="" || filterTempExtent!="" || filterkeywords !="")
            allfilter='<csw:Constraint version="1.1.0"><ogc:Filter><ogc:And>' +
            filterDatatype+' '+ filterbbox +' '+filterTempExtent+' '+filterkeywords +
            '</ogc:And></ogc:Filter></csw:Constraint>';
                  
        
        return '<?xml version="1.0" encoding="UTF-8"?> \
                    <csw:GetRecords\
                      xmlns:csw="http://www.opengis.net/cat/csw/2.0.2"\
                      xmlns:ogc="http://www.opengis.net/ogc"\
                      xmlns:gmd="http://www.isotc211.org/2005/gmd"\
                      xmlns:apiso="http://www.opengis.net/cat/csw/apiso/1.0"\
                      xmlns:ows="http://www.opengis.net/ows"\
                      xmlns:xsd="http://www.w3.org/2001/XMLSchema"\
                      xmlns:gml="http://www.opengis.net/gml"\
                      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\
                      service="CSW"\
                      version="2.0.2"\
                      resultType="results"\
                      outputFormat="application/xml"\
                      xsi:schemaLocation="\
                        http://www.opengis.net/gml\
                        http://schemas.opengis.net/gml/3.2.1/gml.xsd\
                        http://www.opengis.net/cat/csw/2.0.2\
                        http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd\
                      "\
                      outputSchema="http://www.isotc211.org/2005/gmd"\
                      startPosition="1"\
                      maxRecords="1000"\
                    >\
                      <csw:Query typeNames="gmd:MD_Metadata">\
                        <csw:ElementSetName typeNames="gmd:MD_Metadata">full</csw:ElementSetName>'
        + allfilter +
        '</csw:Query>\
                    </csw:GetRecords>'; 
    }
    
    function getRequestBoundingBox(west,south,east,north){  
        
        if(west==""||south=="" ||east=="" ||north==""){
            return "";
        }        
        else{
            return '<ogc:BBOX>\
                        <ogc:PropertyName>BoundingBox</ogc:PropertyName>\
                        <gml:Envelope>\
                            <gml:lowerCorner>'+west+' '+south+'</gml:lowerCorner>\
                            <gml:upperCorner>'+east+' '+north+'</gml:upperCorner>\
                        </gml:Envelope>\
                 </ogc:BBOX>';  
        }        
    }
    
    function getRequestTempExtent(begindate,enddate){
        if(begindate!="" && enddate!="")
        {
            return '<ogc:PropertyIsGreaterThanOrEqualTo>\
                        <ogc:PropertyName>apiso:TempExtent_begin</ogc:PropertyName>\
                        <ogc:Literal>'+begindate+'</ogc:Literal>\
                </ogc:PropertyIsGreaterThanOrEqualTo>\
                <ogc:PropertyIsLessThanOrEqualTo>\
                        <ogc:PropertyName>apiso:TempExtent_end</ogc:PropertyName>\
                        <ogc:Literal>'+enddate+'</ogc:Literal>\
                </ogc:PropertyIsLessThanOrEqualTo>'; 
        }
        else if(begindate!="")
        {
            return '<ogc:PropertyIsGreaterThanOrEqualTo>\
                        <ogc:PropertyName>apiso:TempExtent_begin</ogc:PropertyName>\
                        <ogc:Literal>'+begindate+'</ogc:Literal>\
                </ogc:PropertyIsGreaterThanOrEqualTo>';
        }
        else if(enddate!="")
        {
            return '<ogc:PropertyIsLessThanOrEqualTo>\
                        <ogc:PropertyName>apiso:TempExtent_end</ogc:PropertyName>\
                        <ogc:Literal>'+enddate+'</ogc:Literal>\
                    </ogc:PropertyIsLessThanOrEqualTo>'; 
        }
        else
            return "";
    }
    
    function getRequestKeywords(keyword)
    {
        if(keyword=="")
        {
            return "";
        }
        else{
            return '<ogc:PropertyIsEqualTo>\
                    <ogc:PropertyName>apiso:subject</ogc:PropertyName>\
                    <ogc:Literal>'+keyword+'</ogc:Literal>\
                </ogc:PropertyIsEqualTo>';
        }
    }
    
    //Models and Observations
    function getRequestDatatype(isModels,isObservations)
    {        
        if(isModels && isObservations){
           return '<ogc:Or><ogc:PropertyIsEqualTo>\
                                <ogc:PropertyName>apiso:CoverageContentTypeCode</ogc:PropertyName>\
                                    <ogc:Literal>modelResult</ogc:Literal>\
                   </ogc:PropertyIsEqualTo>\
                   <ogc:PropertyIsEqualTo>\
                                    <ogc:PropertyName>apiso:CoverageContentTypeCode</ogc:PropertyName>\
                                        <ogc:Literal>physicalMeasurement</ogc:Literal>\
                   </ogc:PropertyIsEqualTo></ogc:Or>';
        }
        else if(isModels){
            return '<ogc:PropertyIsEqualTo>\
                                <ogc:PropertyName>apiso:CoverageContentTypeCode</ogc:PropertyName>\
                                    <ogc:Literal>modelResult</ogc:Literal>\
                   </ogc:PropertyIsEqualTo>';
        }
        else
        {
            return '<ogc:PropertyIsEqualTo>\
                                    <ogc:PropertyName>apiso:CoverageContentTypeCode</ogc:PropertyName>\
                                        <ogc:Literal>physicalMeasurement</ogc:Literal>\
                   </ogc:PropertyIsEqualTo>';
        }   
    }   
     
    //ref https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference:Global_Objects:Date
    function getDateTimeFormat(date,time){  
        if(date!="")
        {
            var datef=Ext.util.Format.date(date, 'Y-m-d');
     
            var datetime;
            if(time!="")
                datetime=Date.parseDate(datef+' '+time,"Y-m-d H:i");
            else
                datetime=Date.parseDate(datef,"Y-m-d");   
            
            return datetime;
        }
        else
            return null;
    }
    
    function toUTCDateFormat(datetime)
    {
        function pad(n){
            return n<10 ? '0'+n : n
        }        
        if(datetime!=null)
            return datetime.getFullYear()+'-'
            + pad(datetime.getMonth()+1)+'-'
            + pad(datetime.getDate())+'T'
            + pad(datetime.getHours())+':'
            + pad(datetime.getMinutes())+':'
            + pad(datetime.getSeconds())+'Z'
        
        else
            return "";
    }
    
    function setEnableDisable(isSetDisable){    
            form.getForm().findField('chkmodels').setDisabled(isSetDisable);
            form.getForm().findField('chkobservations').setDisabled(isSetDisable);
            form.getForm().findField('txtWest').setDisabled(isSetDisable);   //minx
            form.getForm().findField('txtSouth').setDisabled(isSetDisable); //miny
            form.getForm().findField('txtEast').setDisabled(isSetDisable); //maxx
            form.getForm().findField('txtNorth').setDisabled(isSetDisable);//maxy
         
    }
    
    function clearValue(){
        form.getForm().findField('chkmodels').reset();
        form.getForm().findField('chkobservations').reset();
        form.getForm().findField('txtWest').reset();   //minx
        form.getForm().findField('txtSouth').reset(); //miny
        form.getForm().findField('txtEast').reset(); //maxx
        form.getForm().findField('txtNorth').reset();//maxy
        form.getForm().findField('txtKeyword').reset();  
        form.getForm().findField('begin_date').reset();
        form.getForm().findField('begin_time').reset();   
        form.getForm().findField('end_date').reset();
        form.getForm().findField('end_time').reset();
    }
});
