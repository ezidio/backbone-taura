/**
 * Views --------------------
 * 
 * 
 */
define([ 'text!common/view/header.html', // Template padrão para o cabeçalho
'text!common/view/message/success.html', // Mensagem de sucesso
// padrão
'text!common/view/message/error.html' ], // Mensagem de erro padrão
// Função
function(header_template, message_success, message_error) {

	var View = {};

	/**
	 * View.Header -------------
	 * 
	 * Cabeçalho contendo o formulário de pesquisa
	 */
	View.Header = Backbone.View.extend({
		el : '#header',
		events : {
			'submit form' : 'search'
		},
		initialize : function(options) {
			_.bindAll(this);
			options = options || {};
			this.template = Handlebars.compile(options.template || header_template);
			this.render();
		},
		render : function() {
			var title = this.$el.attr('title') || '#NO TITLE#';
			this.$el.html(this.template({
				pageTitle : title
			}));
		},
		search : function(ev) {
			ev.preventDefault();
			var term = this.$el.find('form input').val();
			Backbone.history.navigate('search/' + term, {
				trigger : true
			});
		}
	});

	/**
	 * View.List ---------------
	 * 
	 * Comportamento padrão de listagem
	 */
	View.List = Backbone.View.extend({
		el : '#content',
		initialize : function(options) {
			_.bindAll(this);

			$('body').on('crud:save', this.onSaveModel);
			$('body').on('crud:list', this.render);
			this.template = Handlebars.compile(options.template);
		},
		render : function(ev, collection, searchTerm) {
			this.$el.html(this.template({
				'searchTerm' : searchTerm,
				'data' : collection.toJSON()
			}));
			this.$el.find('.dropdown-toggle').dropdown();
		}
	});

	/**
	 * View.Form -----------------------------
	 * 
	 * Comportamento padrão de formulário
	 */
	View.Form = Backbone.View.extend({
		el : '#content',
		events : {
			"submit form" : "save",
			"invalid :input" : "onInvalidField"
		},
		initialize : function(options) {
			_.bindAll(this);
			this.template = Handlebars.compile(options.template);

			$('body').on('crud:edit crud:insert', this.showForm);
		},

		showForm : function(event, model) {
			this.model = model;
			this.render();
		},

		render : function() {
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.find(':input:first').focus();
			return this;
		},
		save : function(ev) {

			ev.preventDefault();
			this.$el.find('.control-group.error').removeClass('error').find('span.help-inline').text('');
			this.$el.find(":submit").button('loading');

			var data = this.$el.find('form').serializeArray();
			var attrs = this.model.toJSON();
			for (i in data) {
				attrs[data[i].name] = data[i].value;
			}

			this.model.save({}, {
				'attrs' : {
					'model' : attrs
				}
			}).success(this.onSuccess).fail(this.onFail);
		},
		onSuccess : function() {
			Backbone.history.navigate('edit/' + this.model.id);
			this.$el.find(":submit").button('reset');
			this.$el.trigger('crud:save:success', [ this.model ]);
		},
		onFail : function(xhr) {
			this.$el.find(":submit").button('reset');
			var errors = eval('(' + xhr.getResponseHeader('errors') + ')');
			for ( var field in errors) {
				this.showFieldErrorMessage(this.$el.find(':input[name="' + field + '"]'), errors[field]);
			}
			this.$el.trigger('crud:save:error', [ this.model, xhr ]);
		},
		onInvalidField : function(event) {
			this.showFieldErrorMessage(event.target, event.target.validationMessage);
		},
		showFieldErrorMessage : function(el, message) {
			$(el).parents('.control-group').addClass('error').find('span.help-inline').text(message);
		}

	});

	/**
	 * View.Message -------------------
	 * 
	 * Classe base para as mensagens
	 */
	View.Message = Backbone.View.extend({
		el : '#content',
		initialize : function(options) {
			_.bindAll(this);
			options = options || {};
			this.template = Handlebars.compile(options.template || this.template);
			$('body').on(this.event, this.render);
		},
		render : function() {
			this.$el.find('.block-messages').html(this.template()).find('a:first').focus();
		}
	});

	View.Message.Success = View.Message.extend({
		event : 'crud:save:success',
		template : message_success
	});

	View.Message.Error = View.Message.extend({
		event : 'crud:save:error',
		template : message_error
	});

	return View;

});