FeedGrid = function(viewer, config) {
    this.viewer = viewer;
    Ext.apply(this, config);
    this.basepath='http://'+document.location.hostname+Drupal.settings.basePath+'issues_response/?url=';
    this.reader= new Ext.data.JsonReader({
            fields:[
            {
                name: 'IssueId',
                mapping:'number'
            },
            {
                name:'Type',
                mapping:'labels',
                convert: function(val, data) {                 
                    if(val==null || val[0]==null)
                        return "--------"
                    else
                        return val[0]['name'];
                }
            },
            {
                name:'Owner',
                mapping:'user.login'
            },
            {
                name: 'title',
                mapping:'title'
            },
            //        {
            //            name:'summary',
            //            mapping:'body',
            //            convert:function(val,data){
            //                var xf = Ext.util.Format;
            //                return xf.ellipsis(xf.stripTags(val), 200) ;
            //            }
            //        },
            {
                name:'assignee',
                mapping:'assignee',
                convert:function(val,data){
                    if(val==null)
                        return "------";
                    else
                        return val['login'];;
                }
            },
            {
                name:'html_url'
            }
            ]
        }); 
    
    this.store = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({
            method: 'GET',
            prettyUrls: false,
            url: 'issues_response'
        }),
        reader:this.reader
    });  
    
    this.columns = [
    {
        id: 'Id', 
        header: "Id", 
        dataIndex: "IssueId", 
        sortable: true,
        width:40
    },
    {
        header:"Type",
        dataIndex:"Type",
        width:100
    },
    {
        header:"Owner Name",
        dataIndex:"Owner",
        width:100
    },
    {
        header: "Title", 
        dataIndex: "title", 
        sortable: true,
        width:500
    },
    {
        header:"Assignee"   ,
        dataIndex:"assignee",
        sortable:true,
        width:100
    }
    ];

    FeedGrid.superclass.constructor.call(this, { 
        sm: new Ext.grid.RowSelectionModel({
            singleSelect:true
        }),
        listeners: {
            'rowdblclick': function(grid, rowIndex, rec){
                var record = grid.getStore().getAt(rowIndex); 
                var data = record.get('html_url');            
                window.open(data);               
            },
            render : function(grid){ 
                var store = grid.getStore();
                store.load.defer(100, store);
                //gridopen.loadFeed('https://api.github.com/repos/asascience-open/ncSOS/issues',true);
            }
        
        }
      
    });
   // this.store.load();
};

Ext.extend(FeedGrid, Ext.grid.GridPanel, {
    loadFeed : function(url,defer) {
        // var basepath ='http://'+document.location.hostname+Drupal.settings.basePath;
        this.store.proxy.conn.url = this.basepath+url;
//        if(defer){           
//            //this.store.load.defer(100, this.store);
//        }
//        else{            
//            this.store.load();
//        }
    }
});
//Ext.reg('appfeedgrid', FeedGrid);