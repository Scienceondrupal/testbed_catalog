Ext.onReady(function() {  
    var gridclosed = new FeedGrid(this,{
        title: "Closed Issues",
        loadMask:true,
        viewConfig: {
            forceFit: true
        }
    });     
    gridclosed.loadFeed('https://api.github.com/repos/asascience-open/ncSOS/issues?state=closed',false);
    
    
    var gridopen = new FeedGrid(this, { 
        title: "Open Issues",
        loadMask:true,
        viewConfig: {
            forceFit: true
        }   
    });     
    gridopen.loadFeed('https://api.github.com/repos/asascience-open/ncSOS/issues',true);     
         
    var tabs = new Ext.TabPanel({
        renderTo: "grid_issues",
        title:"ncSOS Issues",
        layoutOnTabChange: true,        
        activeTab: 0,
        items: [
        gridopen,gridclosed
        ],
        height: 300,
        width :940        
    });
});



