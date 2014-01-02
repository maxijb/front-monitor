/**
 * Rule
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

  attributes: {
	
  	id: 'INTEGER',
  	application_id: 'INTEGER',
  	field : 'STRING',
  	condition : 'STRING',
  	value : 'STRING'
    
  },

  afterCreate : afterChangeRules,
  afterDestroy : afterChangeRules,
  afterUpdate : afterChangeRules

};


function afterChangeRules(item, cb) {
	if (typeof item == "function") 
		rulesService.cacheByApplication(null, item);
	else 
		rulesService.cacheByApplication(item.application_id, cb);
}