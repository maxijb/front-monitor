/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

  attributes: {
  	
  	id : 'INTEGER',
  	nickname: {
  		type: 'STRING',
  		required: true
  	},
  	password: {
  		type: 'STRING',
  		required: true
  	},
  	mail: 'STRING'

  	
    
  }

};
