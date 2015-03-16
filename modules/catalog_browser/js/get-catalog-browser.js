Ext.onReady(function() {
//    Ext.QuickTips.init();


    function getRequestString(filter){
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
                      maxRecords="2000"\
                    >\
                      <csw:Query typeNames="gmd:MD_Metadata">\
                        <csw:ElementSetName typeNames="gmd:MD_Metadata">full</csw:ElementSetName>\
                        <csw:Constraint version="1.1.0">'
                             + filter +
                        '</csw:Constraint>\
                      </csw:Query>\
                    </csw:GetRecords>';
        
     
    }

    var iurl='http://testbedapps.sura.org/gi-cat/services/cswiso?';  
    
     var filterModels='<ogc:Filter>\
                            <ogc:PropertyIsEqualTo>\
                                <ogc:PropertyName>apiso:CoverageContentTypeCode</ogc:PropertyName>\
                                    <ogc:Literal>modelResult</ogc:Literal>\
                            </ogc:PropertyIsEqualTo>\
                      </ogc:Filter>';                        
    
     var filterObservations='<ogc:Filter>\
                                <ogc:PropertyIsEqualTo>\
                                    <ogc:PropertyName>apiso:CoverageContentTypeCode</ogc:PropertyName>\
                                        <ogc:Literal>physicalMeasurement</ogc:Literal>\
                                </ogc:PropertyIsEqualTo>\
                           </ogc:Filter>';                        
    
    var filterUndefined='<ogc:Filter><ogc:Not><ogc:Or>\
                                <ogc:PropertyIsEqualTo>\
                                    <ogc:PropertyName>apiso:CoverageContentTypeCode</ogc:PropertyName>\
                                        <ogc:Literal>physicalMeasurement</ogc:Literal>\
                                </ogc:PropertyIsEqualTo>\
                                <ogc:PropertyIsEqualTo>\
                                <ogc:PropertyName>apiso:CoverageContentTypeCode</ogc:PropertyName>\
                                    <ogc:Literal>modelResult</ogc:Literal>\
                                </ogc:PropertyIsEqualTo>\
                          </ogc:Or></ogc:Not></ogc:Filter>'; 
  
   var proxyModels = new Ext.data.HttpProxy({
        method: 'GET',
        prettyUrls: false,
        url: 'catalogresponse/?isourl='+iurl+'&isodata='+getRequestString(filterModels) // see options parameter for Ext.Ajax.request
    });
    
        
    var proxyObservations = new Ext.data.HttpProxy({
        method: 'GET',
        prettyUrls: false,
        url: 'catalogresponse/?isourl='+iurl+'&isodata='+getRequestString(filterObservations) // see options parameter for Ext.Ajax.request
    });
    
    var proxyUndefined = new Ext.data.HttpProxy({
        method: 'GET',
        prettyUrls: false,
        url: 'catalogresponse/?isourl='+iurl+'&isodata='+getRequestString(filterUndefined) // see options parameter for Ext.Ajax.request
    });
    
    var isoreader = new GeoExt.data.CSWRecordsReader({
            fields:[                           
                  {name:'Title',mapping:'identificationInfo/MD_DataIdentification/citation/CI_Citation/title/CharacterString'}, 
                            {name:'west',mapping:'identificationInfo/MD_DataIdentification/extent/EX_Extent/geographicElement/EX_GeographicBoundingBox/westBoundLongitude/Decimal'},
                            {name:'east',mapping:'identificationInfo/MD_DataIdentification/extent/EX_Extent/geographicElement/EX_GeographicBoundingBox/eastBoundLongitude/Decimal'},
                            {name:'south',mapping:'identificationInfo/MD_DataIdentification/extent/EX_Extent/geographicElement/EX_GeographicBoundingBox/southBoundLatitude/Decimal'},
                            {name:'north',mapping:'identificationInfo/MD_DataIdentification/extent/EX_Extent/geographicElement/EX_GeographicBoundingBox/northBoundLatitude/Decimal'},
                            {name:'Code',mapping:'identificationInfo/MD_DataIdentification/citation/CI_Citation/identifier/MD_Identifier/code/CharacterString'},
                            {name:'URL',mapping:'distributionInfo/MD_Distribution/distributor/MD_Distributor/distributorTransferOptions/MD_DigitalTransferOptions/onLine/CI_OnlineResource/linkage/URL',
								convert: function(val, data) {
										if(val==null || val[0]==null)
											return "";
										else
											return val[0]['value'];
									}
							},
                            {name:'Keywords',mapping:'identificationInfo/MD_DataIdentification/descriptiveKeywords/MD_Keywords/keyword/CharacterString'},
                            {name:'Summary',mapping:'identificationInfo/MD_DataIdentification/abstract/CharacterString'}          
        ]
        });
                          
    var storeModels = new Ext.data.Store({
        proxy : proxyModels,
        reader: isoreader
    });
            
    var storeObservations = new Ext.data.Store({
        proxy : proxyObservations,
        reader: isoreader
    });
    
    var storeUndefined = new Ext.data.Store({
        proxy : proxyUndefined,
        reader: isoreader
    });
    
  // define a template to use for the detail view
  var isoTplMarkup = [
    '<div class="detailtextlarge"><b>Keywords:</b>{Keywords}</div>',
    '<div class="detailtextlarge"><b>URL:</b> <a href="{URL}" target="_blank">{URL}</a></div>',
    '<div class="detailtextlarge"><b>Summary:</b>{Summary}</div>',
  ];
  var isoTpl = new Ext.Template(isoTplMarkup);     
   
     // row expander
    var expander =  new Ext.grid.RowExpander({
        tpl : isoTpl
    }); 
    
    var expanderOberservations =  new Ext.grid.RowExpander({
        tpl : isoTpl
    });
    
    var expanderUndefined =  new Ext.grid.RowExpander({
        tpl : isoTpl
    });
    
    // create grid to display records from the store
    var gridModels =  new Ext.grid.GridPanel({
        title:'Models',
        store: storeModels,
        cm: new Ext.grid.ColumnModel([
        expander,
        new Ext.grid.RowNumberer(),
        {id: 'Title',header: "Title", dataIndex: "Title", sortable: true,width:310},
        {header: "Geographic Bounding Box", dataIndex: "north", sortable: true,width: 320,
            renderer: function(value, p, r)
            {
                return 'W : '+r.data['west'] + ', E : ' + r.data['east']+', S :'+r.data['south']+', N :'+r.data['north']
            }
        },
        {
            header: "Location", 
            dataIndex: "Code", 
            sortable: true, 
            width: 310
        }
        ]),
       // iconCls: 'icon-grid',       
        plugins: expander,      
       // collapsible: true,
       // animCollapse: true,
       // renderTo:'cswgridModels',
        stripeRows: true,
        autoExpandColumn: 'Title',       
        //autoHeight: false,
        width: 940,
        height:300,
        sm: new Ext.grid.RowSelectionModel({singleSelect: true}),       
        viewConfig: {
          forceFit: true
        }
        ,loadMask:true        
    });  
    
    var gridObservations =  new Ext.grid.GridPanel({
        title:'Observations',
        store: storeObservations,
        cm: new Ext.grid.ColumnModel([
        expanderOberservations,
        new Ext.grid.RowNumberer(),
        {id: 'Title',header: "Title", dataIndex: "Title", sortable: true,width:310},
        {header: "Geographic Bounding Box", dataIndex: "north", sortable: true,width: 320,
            renderer: function(value, p, r)
            {
                return 'W : '+r.data['west'] + ', E : ' + r.data['east']+', S :'+r.data['south']+', N :'+r.data['north']
            }
        },
        {
            header: "Location", 
            dataIndex: "Code", 
            sortable: true, 
            width: 310
        }
        ]),
        //iconCls: 'icon-grid',       
        plugins: expanderOberservations,
        //maxHeight:1000, 
        //autoHeight:false,        
        //collapsible: true,
        //animCollapse: true,
        //autoLoad: false,
        //renderTo:'cswgridObservations',
        stripeRows: true,
        autoExpandColumn: 'Title',       
       // autoHeight: true,
        width: 940,
        height:300,
        sm: new Ext.grid.RowSelectionModel({singleSelect: true}),       
        viewConfig: {
          forceFit: true
        },
      loadMask:true,
      listeners : {
       render : function(gridObservations){      
          // gridObservations.body.mask('Loading...');
           var store = gridObservations.getStore();
           store.load.defer(100, store);
           //store.load();
       }
    }
    }); 
    
        var gridUndefined =  new Ext.grid.GridPanel({
        title:'Undefined',
        store: storeUndefined,
        cm: new Ext.grid.ColumnModel([
        expanderUndefined,
        new Ext.grid.RowNumberer(),
        {id: 'Title',header: "Title", dataIndex: "Title", sortable: true,width:310},
        {header: "Geographic Bounding Box", dataIndex: "north", sortable: true,width: 320,
            renderer: function(value, p, r)
            {
                return 'W : '+r.data['west'] + ', E : ' + r.data['east']+', S :'+r.data['south']+', N :'+r.data['north']
            }
        },
        {
            header: "Location", 
            dataIndex: "Code", 
            sortable: true, 
            width: 310
        }
        ]),
        //iconCls: 'icon-grid',       
        plugins: expanderUndefined,
        //maxHeight:1000, 
        //autoHeight:false,        
        //collapsible: true,
        //animCollapse: true,
        //autoLoad: false,
        //renderTo:'cswgridObservations',
        stripeRows: true,
        autoExpandColumn: 'Title',       
       // autoHeight: true,
        width: 940,
        height:300,
        sm: new Ext.grid.RowSelectionModel({singleSelect: true}),       
        viewConfig: {
          forceFit: true
        },
      loadMask:true,
      listeners : {
       render : function(gridUndefined){      
          // gridObservations.body.mask('Loading...');
           var store = gridUndefined.getStore();
           store.load.defer(100, store);
           //store.load();
       }
    }
    });
    
    var tabs = new Ext.TabPanel({
        renderTo: "cswgridModels",
        layoutOnTabChange: true,
        activeTab: 0,
        items: [
        gridModels,gridObservations,gridUndefined
        ],
        width: 940        
    });
    
    storeModels.load();
    
    storeObservations.on('load', function(_store, _records) {
        setGridHeight(gridObservations,storeObservations);
    });
    
    storeModels.on('load', function(_store, _records) {
        setGridHeight(gridModels,storeModels);
    });    
    
    storeUndefined.on('load', function(_store, _records) {
        setGridHeight(gridUndefined,storeUndefined);
    });  
    
     function setGridHeight(grid,store){
        var rowcount=store.getCount();
        var _height=rowcount*29;
        if(_height>765)
            _height=765;
        else if(_height<300)
            _height=300;
        grid.setHeight(_height);
    }
    
    function showLoadingMask(loadingMessage)
    {
        if (Ext.isEmpty(loadingMessage))
        var loadText = 'Loading... Please wait';
        //Use the mask function on the Ext.getBody() element to mask the body element during Ajax calls
        Ext.Ajax.on('beforerequest',function(){Ext.getBody().mask(loadText, 'loading')}, Ext.getBody());
        Ext.Ajax.on('requestcomplete',Ext.getBody().unmask ,Ext.getBody());
        Ext.Ajax.on('requestexception', Ext.getBody().unmask , Ext.getBody());
    }
    
//deleteWindow.show();
});

