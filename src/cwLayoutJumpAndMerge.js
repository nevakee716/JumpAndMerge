/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery*/

(function(cwApi) {
    'use strict';
    var cwLayoutJumpAndMerge;

    cwLayoutJumpAndMerge = function(options, viewSchema) {
        cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema);
        this.drawOneMethod = cwApi.cwLayouts.cwLayoutList.drawOne.bind(this);
        cwApi.registerLayoutForJSActions(this);
    };

    cwLayoutJumpAndMerge.prototype.drawAssociations = function(output, associationTitleText, object) {
        /*jslint unparam:true*/
        var fakeItem, obj, nextLayout;
        obj = cwLayoutJumpAndMerge.getNextLayoutNodeAndItems(this, this.viewSchema, [object]);

        if (!cwApi.isUndefined(obj)){
            nextLayout = obj.layout;            
            fakeItem = {
                associations:{}
            };
            fakeItem.associations[nextLayout.nodeID] = obj.data;
            nextLayout.drawAssociations(output, null, fakeItem, null);
        }
    };

    cwLayoutJumpAndMerge.getNextLayoutNodeAndItems = function(node, schema, sources){
        var i, j, item, tgt, nextNodeId, associationSchema, nextLayout, targets = [], itemsToDisplay = [], distinct = {};

        if (node.mmNode.SortedChildren.length > 1){
            return;
        }
        
        if (node.mmNode.LayoutName === 'cwLayoutJumpAndMerge'){
            for(i=0; i<sources.length; i+=1){
                item = sources[i];
                targets = targets.concat(item.associations[node.mmNode.NodeID]);
            }
            nextNodeId = node.mmNode.SortedChildren[0].NodeId;  
            associationSchema = cwApi.ViewSchemaManager.getNode(schema, nextNodeId);
            nextLayout = new cwApi.cwLayouts[associationSchema.LayoutName](associationSchema.LayoutOptions, schema);
            return cwLayoutJumpAndMerge.getNextLayoutNodeAndItems(nextLayout, schema, targets);
        }
        // set itemsToDisplay

        for(i=0; i<sources.length; i+=1){
            item = sources[i];
            for(j=0; j<item.associations[node.mmNode.NodeID].length; j+=1){
                tgt = item.associations[node.mmNode.NodeID][j];
                if (!distinct.hasOwnProperty(tgt.object_id)){
                    distinct[tgt.object_id] = tgt;
                    itemsToDisplay.push(tgt);
                }
            }
        }
        return {layout : node, data:itemsToDisplay};
    };

    cwApi.cwLayouts.cwLayoutJumpAndMerge = cwLayoutJumpAndMerge;

}(cwAPI, jQuery));