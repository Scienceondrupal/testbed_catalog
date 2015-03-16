Ext.onReady(function() {      
    var ni = document.getElementById('content');
    var newdiv = document.createElement('div');  
    newdiv.setAttribute('id',"grid_issues");
    newdiv.style.padding="20px 0 0 0";
    ni.appendChild(newdiv);
    
    var basepath ='http://'+document.location.hostname+Drupal.settings.basePath;    
    var store = new Ext.data.ArrayStore({
        fields: [
        {
            name: 'id', type: 'int'
        },
        {
            name: 'type'
        },
        {
            name: 'status'
        },
        {
            name: 'priority'
        },
        {
            name: "ownername"
        },
        {
            name: 'title'
        }
        ],sortInfo: { field: "id", direction: "DESC" }
    });    
  
    var grid = new Ext.grid.GridPanel({
        title: "NCToolBox Issues",
        store: store,
        columns: [
        {
            id: 'Id', 
            header: "Id", 
            dataIndex: "id", 
            sortable: true,
            width:40
        },
        {
            header: "Type", 
            dataIndex: "type", 
            sortable: true,
            width:100
        },
        {
            header: "Status", 
            dataIndex: "status", 
            sortable: true,
            width:70
        },
        {
            header: "Priority", 
            dataIndex: "priority", 
            sortable: true,
            width:80
        },
        {
            header: "Owner Name", 
            dataIndex: "ownername", 
            sortable: true,
            width:130
        },
        {
            header: "Title", 
            dataIndex: "title", 
            sortable: true,
            width:499
        }
        ],        
        loadMask:true,
        height: 500,
        width :940,  
        sm: new Ext.grid.RowSelectionModel({
            singleSelect:true
        }),
        listeners: {
            'rowdblclick': function(grid, rowIndex, rec){
                var record = grid.getStore().getAt(rowIndex); 
                var fieldName = grid.getColumnModel().getDataIndex(0); 
                var data = record.get(fieldName);
                var singleurl='http://code.google.com/p/nctoolbox/issues/detail?id='+data+'&can=1';
                //commentgrid.loadFeed(basepath+'issues_response/?url=https://code.google.com/feeds/issues/p/nctoolbox/issues/'+data+'/comments/full');
                window.open(singleurl);
               
            }
        }
    })
    
    showLoadingMask("");
    
    Ext.Ajax.request({
        url: basepath+'issues_response/?url=https://code.google.com/feeds/issues/p/nctoolbox/issues/full?max-results=1000', // see options parameter for Ext.Ajax.request
        //url: 'https://code.google.com/feeds/issues/p/nctoolbox/issues/full',
        method: 'GET',
        //url: 'proxymediator.php/?isourl='+iurl+'&isodata='+getRequestString(filterModels),
        success: function(response, opts) {
            var xmlDoc=response.responseXML;
            var x = xmlDoc.documentElement.getElementsByTagName("entry");
            var datacollection=new Array();
            var myData = new Array();    
            for (var i = 0; i < x.length; i++) {                  
                datacollection =  new Array();
                datacollection[0]=getNodeValue("issues:id",x[i],0);
                datacollection[1]=getNodeValue("issues:label",x[i],0).substring(5);  //for type
                datacollection[2]=getNodeValue("issues:status",x[i],0);
                datacollection[3]=getNodeValue("issues:label",x[i],1).substring(9);  //for priority  
                datacollection[4]=getChildNodeValue("issues:owner",x[i],"issues:username");//child   //issues:username               
                datacollection[5]=getNodeValue("title",x[i],0);
                //datacollection[5]=getNodeValue("id",x[i]);
                myData.push(datacollection);        
            }
            // alert(myData);
            store.loadData(myData); 
        },
        failure: function(response, opts) {
            //console.log('server-side failure with status code ' + response.status);
            alert("failure");
        }
    }); 
    
	 /*ncsos-issues*/
    var ncsos_gridclosed = new FeedGrid(this,{
        title: "Closed Issues",        
        viewConfig: {
            forceFit: true
        }
    });     
    ncsos_gridclosed.loadFeed('https://api.github.com/repos/asascience-open/ncSOS/issues?state=closed',false);
    
    
    var ncsos_gridopen = new FeedGrid(this, { 
        title: "Open Issues",        
        viewConfig: {
            forceFit: true
        }   
    });     
    ncsos_gridopen.loadFeed('https://api.github.com/repos/asascience-open/ncSOS/issues',true);     
         
    var ncsos_tabs = new Ext.TabPanel({        
        title:"ncSOS Issues",
        layoutOnTabChange: true,        
        activeTab: 0,
        items: [
        ncsos_gridopen,ncsos_gridclosed
        ],
        viewConfig: {
            forceFit: true
        }     
    });
    
    /****************************/
    
    //imeds issue
    var imeds_gridclosed = new FeedGrid(this,{
        title: "Closed Issues",       
        viewConfig: {
            forceFit: true
        }
    });     
    imeds_gridclosed.loadFeed('https://api.github.com/repos/acrosby/imeds2netcdf_crawler/issues?state=closed',false);
    
    
    var imeds_gridopen = new FeedGrid(this, { 
        title: "Open Issues",        
        viewConfig: {
            forceFit: true
        }   
    });     
    imeds_gridopen.loadFeed('https://api.github.com/repos/acrosby/imeds2netcdf_crawler/issues',true);     
         
    var imeds_tabs = new Ext.TabPanel({      
        title:"Imeds Issues",
        layoutOnTabChange: true,        
        activeTab: 0,
        items: [
        imeds_gridopen,imeds_gridclosed
        ],
        height: 300,
        width :940        
    });
    
    ///////////
    
    var alltabs = new Ext.TabPanel({
        renderTo: "grid_issues",
        title:"Testbed Issues",
        layoutOnTabChange: true,        
        activeTab: 0,
        items: [
        grid,ncsos_tabs,imeds_tabs
        ],
        height: 300,
        width :940    
    });
    
	
    function getNodeValue(nodename,currentTree,index){
        var nodeobj =getNode(nodename,currentTree,index);
        if(nodeobj!=null){
            return nodeobj.childNodes[0].nodeValue;
        }
        return "";
    }
    
    function getChildNodeValue(nodename,currentTree,childname){       
        var nodeobj =getNode(nodename,currentTree,0);
        if(nodeobj!=null){
            var nodechildobj =getNode(childname,nodeobj,0);
            if(nodechildobj!=null){
                return nodechildobj.childNodes[0].nodeValue;
            }
        }
        return "";          
    }
    
    function getNode(nodename,currentTree,index){
        var colonIndex = nodename.indexOf(":");
        var tag = nodename.substr(colonIndex + 1);
        if(currentTree.getElementsByTagNameNS){
            var nodes = currentTree.getElementsByTagNameNS("*", tag);
            for (var i = 0; i < nodes.length; i++)
            {
                if (nodes[i].nodeName == nodename)
                    if(index==0)
                        return nodes[i]         
                    else 
                        return nodes[index];
            }
        }
        return null;
    } 
    
    function showLoadingMask(loadingMessage)
    {
        if (Ext.isEmpty(loadingMessage))
            var loadText = 'Loading... Please wait';
        //Use the mask function on the Ext.getBody() element to mask the body element during Ajax calls
        Ext.Ajax.on('beforerequest',function(){
            Ext.getBody().mask(loadText, 'loading')
        }, Ext.getBody());
        Ext.Ajax.on('requestcomplete',Ext.getBody().unmask ,Ext.getBody());
        Ext.Ajax.on('requestexception', Ext.getBody().unmask , Ext.getBody());
    }    
});

