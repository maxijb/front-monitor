/**
 * Pageview
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */



module.exports = {

		autoCreatedAt: false,
	  	autoUpdatedAt: false,

  attributes: {
  	
  	id: 'INTEGER',
  	application : {
  		type: 'INTEGER',
  		required: true
  	},
  	url : {
  		type: 'STRING',
  		required: true
  	},
  	uow: 'STRING',
  	custom_parameter: 'STRING',
  	user_agent : 'STRING',
  	browser: 'STRING',
  	major_version: 'STRING',
  	cookies: 'STRING',
  	os: 'STRING',
  	createdAt : 'timestamp'
    
  },
  
  getDefaultObject: function() { return defaultObject}

};


//create default objects to be extended later
var defaultObject = createDefaultObject();
function createDefaultObject() {
	var obj = {};
	  for (var i in module.exports.attributes) {
		  if (i != 'id') {
			  obj[i] = (module.exports.attributes[i].type == "integer") ? 0 : '';
		  }
	  }
	  return obj;
}