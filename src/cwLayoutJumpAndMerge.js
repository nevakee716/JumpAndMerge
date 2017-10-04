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
        if (cwApi.queryObject.isCreatePage()) {
            return;
        }
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
        var i, j, k, obj, item, tgt, nextNodeId, associationSchema, nextLayout, targets = [],
            itemsToDisplay = [], distinct = {},
            poppedObj, nodes;
        
        if (node.mmNode.LayoutName === 'cwLayoutJumpAndMerge'){
            for(i=0; i<sources.length; i+=1){
                item = sources[i];
                targets = targets.concat(item.associations[node.mmNode.NodeID]);
            }

            for(k=0; k<node.mmNode.SortedChildren.length; k+=1){
                nextNodeId = node.mmNode.SortedChildren[k].NodeId;  
                associationSchema = cwApi.ViewSchemaManager.getNode(schema, nextNodeId);
                nextLayout = new cwApi.cwLayouts[associationSchema.LayoutName](associationSchema.LayoutOptions, schema);
                obj = cwLayoutJumpAndMerge.getNextLayoutNodeAndItems(nextLayout, schema, targets);

                while(obj.data.length > 0){
                    poppedObj = obj.data.pop();
                    if(!distinct.hasOwnProperty(poppedObj.object_id)){
                        distinct[poppedObj.object_id] = poppedObj;
                        itemsToDisplay.push(poppedObj);
                    }
                }
            }
            return {
                layout: obj.layout,
                data: itemsToDisplay
            }
        }
        // set itemsToDisplay

        for(i=0; i<sources.length; i+=1){
            item = sources[i];
            if (item !== undefined){
                nodes = item.associations[node.mmNode.NodeID];
                if (nodes !== undefined){
                    for(j=0; j<nodes.length; j+=1){
                        tgt = nodes[j];
                        if (!distinct.hasOwnProperty(tgt.object_id)){
                            distinct[tgt.object_id] = tgt;
                            itemsToDisplay.push(tgt);
                        }
                    }
                }
            }
        }
        return {layout : node, data:itemsToDisplay};
    };

    cwApi.cwLayouts.cwLayoutJumpAndMerge = cwLayoutJumpAndMerge;

}(cwAPI, jQuery));