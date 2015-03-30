//configuration object

var config = {
    title:"Vanuatu Cyclone Pam 3W",
    description:"<p>Who is doing what and where in the cyclone Pam response.  Click the graphs or map to interact.</p><p>Contact: <a href='https://twitter.com/Simon_B_Johnson' target='_blank'>Simon Johnson</a> - <a href='https://docs.google.com/spreadsheets/d/1LzBqy_jH7XpKFket3iZIFtPrt04jnnF76Y0t_rBL53w/edit?usp=sharing' target='_blank'>Source</a></p>",
    data:"data/data.json",
    whoFieldName:"organisation",
    whatFieldName:"activity",
    whereFieldName:"adm2_code",
    geo:"data/vanuatu.geojson",
    joinAttribute:"adm2code",
    x:"172.3000",
    y:"-19",
    zoom:"5000",
    colors:['#81d4fa','#4fc3f7','#29b6f6','#03a9f4','#039be5','#0288d1','#0277bd','#01579b']
};

//function to generate the 3W component
//data is the whole 3W Excel data set
//geom is geojson file

function generate3WComponent(config,data,geom){    
    
    $('#title').html(config.title);
    $('#description').html(config.description);

    var whoChart = dc.rowChart('#hdx-3W-who');
    var whatChart = dc.rowChart('#hdx-3W-what');
    //var whereChart = dc.geoChoroplethChart('#hdx-3W-where');
    var whereChart = dc.leafletChoroplethChart('#hdx-3W-where');

    var cf = crossfilter(data);

    var whoDimension = cf.dimension(function(d){ return d[config.whoFieldName]; });
    var whatDimension = cf.dimension(function(d){ return d[config.whatFieldName]; });
    var whereDimension = cf.dimension(function(d){ return d[config.whereFieldName]; });

    var whoGroup = whoDimension.group();
    var whatGroup = whatDimension.group();
    var whereGroup = whereDimension.group();
    var all = cf.groupAll();

    whoChart.width($('#hxd-3W-who').width()).height(400)
            .dimension(whoDimension)
            .group(whoGroup)
            .elasticX(true)
            //.data(function(group) {
            //    return group.top(15);
            //})
            //.top(15)
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0,7])
            .colorAccessor(function(d, i){return i%8;})
            .xAxis().ticks(5);

    whatChart.width($('#hxd-3W-what').width()).height(400)
            .dimension(whatDimension)
            .group(whatGroup)
            .elasticX(true)
            //.data(function(group) {
            //    return group.top(15);
            //})
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0,7])
            .colorAccessor(function(d, i){return i%8;})
            .xAxis().ticks(5);

    dc.dataCount('#count-info')
            .dimension(cf)
            .group(all);
    /*
    whereChart.width($('#hxd-3W-where').width()).height(400)
            .dimension(whereDimension)
            .group(whereGroup)
            .colors(['#DDDDDD', config.colors[3]])
            .colorDomain([0, 1])
            .colorAccessor(function (d) {
                if(d>0){
                    return 1;
                } else {
                    return 0;
                }
            })
            .overlayGeoJson(geom.features, 'Regions', function (d) {
                return d.properties[config.joinAttribute];
            })
            .projection(d3.geo.mercator().center([config.x,config.y]).scale(config.zoom))
            .title(function(d){
                return lookup[d.key];
            });
            */
           
        whereChart.width($('#hxd-3W-where').width()).height(400)
            .dimension(whereDimension)
            .group(whereGroup)
            .center([42.69,25.42])
            .zoom(7)    
            .geojson(geom)
            .colors(['#DDDDDD', config.colors[3]])
            .colorDomain([0, 1])
            .colorAccessor(function (d) {
                if(d>0){
                    return 1;
                } else {
                    return 0;
                }
            })           
            .featureKeyAccessor(function(feature){
                return feature.properties[config.joinAttribute];
            });            
            
          //.mapOptions({..})       - set leaflet specific options to the map object; Default: Leaflet default options
          //.center([1.1,1.1])      - get or set initial location
          //.zoom(7)                - get or set initial zoom level
          //.map()                  - get map object
          //.geojson()              - geojson object describing the features
          //.featureOptions()       - object or a function (feature) to set the options for each feature
          //.featureKeyAccessor()   - function (feature) to return a feature property that would be compared to the group key; Defauft: feature.properties.key
          //.popup()                - function (d,feature) to return the string or DOM content of a popup
          //.renderPopup(true)      - set if popups should be shown; Default: true
          //.brushOn(true)          - if the map would select datapoints; Default: true           

    dc.renderAll();
    
    var g = d3.selectAll('#hdx-3W-who').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-who').width()/2)
        .attr('y', 400)
        .text('Activities');

    var g = d3.selectAll('#hdx-3W-what').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-what').width()/2)
        .attr('y', 400)
        .text('Activities');  

}

//load 3W data

var dataCall = $.ajax({ 
    type: 'GET', 
    url: config.data, 
    dataType: 'json',
});

//load geometry

var geomCall = $.ajax({ 
    type: 'GET', 
    url: config.geo, 
    dataType: 'json'
});

//when both ready construct 3W

$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var geom = geomArgs[0];
    geom.features.forEach(function(e){
        e.properties[config.joinAttribute] = String(e.properties[config.joinAttribute]); 
    });
    generate3WComponent(config,dataArgs[0],geom);
});

