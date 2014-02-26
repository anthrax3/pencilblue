/**
 * Manage custom objects via a table
 * 
 * @author Blake Callens <blake@pencilblue.org>
 * @copyright PencilBlue 2014, All rights reserved
 */
function ManageObjects() {}

//inheritance
util.inherits(ManageObjects, pb.BaseController);

ManageObjects.prototype.render = function(cb) {
	var self = this;
	var vars = this.pathVars;
    if(!vars['name']) {
        cb(pb.RequestHandler.generateRedirect(pb.config.siteRoot + '/admin/content/custom_objects/manage_object_types'));
        return;
    }
	
	var dao  = new pb.DAO();
	dao.query('custom_object_type', {name: vars['name']}).then(function(customObjectTypes) {
		if (util.isError(customObjectTypes)) {
			//TODO handle this
		}
		
		//none to manage
        if(customObjectTypes.length == 0) {                
            cb(pb.RequestHandler.generateRedirect(pb.config.siteRoot + '/admin/content/custom_objects/manage_object_types'));
            return;
        }
        
        var objectType = customObjectTypes[0];
        
        dao.query('custom_object', {type: objectType._id.toString()}).then(function(customObjects) {
		    if (util.isError(customObjects)) {
			    //TODO handle this
		    }
		
		    //none to manage
            if(customObjects.length == 0) {                
                cb(pb.RequestHandler.generateRedirect(pb.config.siteRoot + '/admin/content/custom_objects/new_object/' + vars['name']));
                return;
            }
            
            //currently, mongo cannot do case-insensitive sorts.  We do it manually 
            //until a solution for https://jira.mongodb.org/browse/SERVER-90 is merged.
            customObjects.sort(function(a, b) {
                var x = a['name'].toLowerCase();
                var y = b['name'].toLowerCase();
            
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        
            pb.templates.load('admin/content/custom_objects/manage_objects', '^loc_MANAGE^ ' + objectType.name, null, function(data) {
                var result = ''+data;
                    
                self.displayErrorOrSuccess(result, function(newResult) {
                    result = newResult;
                    
                    var pills =
                    [
                        {
                            name: 'manage_objects',
                            title: '^loc_MANAGE^ ' + objectType.name + ' ^loc_OBJECTS^',
                            icon: 'chevron-left',
                            href: '/admin/content/custom_objects/manage_object_types'
                        },
                        {
                            name: 'new_object',
                            title: '',
                            icon: 'plus',
                            href: '/admin/content/custom_objects/new_object/' + objectType.name
                        }
                    ];
                    
                    result = result.concat(pb.js.getAngularController(
                    {
                        navigation: pb.AdminNavigation.get(self.session, ['content', 'custom_objects']),
                        pills: pills,
                        customObjects: customObjects,
                        objectType: objectType
                    }, [], 'initCustomObjectsPagination()'));
                    
                    var content = self.localizationService.localize(['admin', 'custom_objects'], result);
                    cb({content: content});
                });
            });
        });
    });
};

//exports
module.exports = ManageObjects;
