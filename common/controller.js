/**
 * Controller padrão para formulários
 *  - alwaysLoadOnEdit (padrão = false) Sempre busca o registro via rest para
 * editá-lo. Caso esse atributo seja falso, o registro só será carregado quando
 * ele não existir na lista
 * 
 * 
 * @author Everton Tavares
 * @since 02/02/2013
 */
define([], function() {

	return Backbone.Router.extend({
		routes : {
			"" : "list",
			"edit/:id" : "edit",
			"insert" : "insert",
			"search/*query" : "search"
		},

		/**
		 * Inicializa o controller
		 * 
		 * @param options
		 */
		initialize : function(options) {
			_.bindAll(this);
			

			// Recupera a coleção
			this.collection = options.collection;
			this.collection.on('reset', this.list);
			this.searchTerm = '';
			
			// Observa os eventos no elemento body
			this.$el = $('body');
			this.$el.on('crud:save:success', this.onSaveSuccess);

			// Ajusta os atributos default
			this.options = _.extend({
				alwaysLoadOnEdit : false
			}, options);

		},
		onSaveSuccess : function(ev, model) {
			if (this.collection.get(model.id) == null) {
				this.collection.add(model);
			}
		},
		/**
		 * Cria um novo registro e lança um evento informando da inserção
		 */
		insert : function() {
			this.$el.trigger('crud:insert', [this.collection._prepareModel()]);
		},

		/**
		 * Realiza uma pesquisa por termo
		 * 
		 * @param query
		 */
		search : function(query) {
			this.searchTerm = query;
			this.collection.fetch({
				data : {
					'q' : query
				}
			});
		},

		/**
		 * Edita um registro
		 * 
		 * Se encontrar o modelo na lista, simplesmente manda editar, caso
		 * contrário, realiza uma busca e exibe o formulário.
		 * 
		 * Caso o parametro "alwaysLoadOnedit for igual a true, irá carregar
		 * buscar via rest, independente se ja existe na lista
		 * 
		 * @param id
		 */
		edit : function(id) {
			var model = this.collection.get(id);

			if (model && !this.options.alwaysLoadOnEdit) {
				this.showFormView(model);
			} else {
				this.collection._prepareModel({
					id : id
				}).fetch().success(this.showFormView);
			}
		},

		/**
		 * Lança o evento informando que deve-se listar os registros
		 */
		list : function() {
			this.$el.trigger("crud:list", [this.collection, this.searchTerm]);
		},

		/**
		 * Lança um evento informando que deve-se editar um registro
		 * 
		 * É utilizado o método "_prepareModel" da lista para garantir que o
		 * registro será um Model
		 * 
		 * @param model
		 */
		showFormView : function(model) {
			this.$el.trigger('crud:edit', [this.collection._prepareModel(model)]);
		}

	});
});