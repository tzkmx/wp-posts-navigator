/* global jQuery, location */
/**
 * @author Jesús E. Franco Martinez
 * @since 28/07/2019
 */
(function ($) {
  $.widget('tzkmx.postsnavigator', {
    options: {
      page: 1,
      per_page: 4,
      base: location.origin + '/wp-json/wp/v2/posts/',
      totalPosts: false
    },
    _create: function () {
      this.element.addClass('tzkmx-postsnavigator ui-widget')
      this.element.find('ul').addClass('ui-widget-content')

      this.renderList()
      this._on(this.element, {
        'click .load-more': this.next,
        'click .go-back': this.prev
      })
    },
    next: function () {
      var elemsLength = this.element.find('li').length

      var nextPage = this.options.page + 1

      if ((!this.options.totalPosts) ||
                (elemsLength < this.options.totalPosts)
            ) {
        this.loadMorePosts(nextPage)
      }
      this._advancePage(nextPage)
    },
    prev: function () {
      var page = this.options.page - 1
      if (page >= 1) {
        this.option('page', page)
      }
    },
    _setOption (key, value) {
      this._super(key, value)
      if (key === 'page') {
        this.renderList(true)
      } else {
        this.renderList()
      }
    },
    renderList: function (change = false) {
      var upto = this.options.per_page * this.options.page
      var from = this.options.per_page * (this.options.page - 1)
      var list = this.element.find('li')
      list.each(function (idx, elem) {
        if (idx >= from && idx < upto) {
          $(elem).show()
        } else {
          $(elem).hide()
        }
      })
      if (change) {
        $('html, body').animate({
          scrollTop: $(this.element).offset().top
        }, 1600)
      }

      this.element.find('.controls').remove()
      var controls = $('<div>')
                .attr('class', 'controls')
      if (this.options.page > 1) {
        controls.append('<div class="button go-back">Regresar</div>')
      }
      var maxshown = this.options.per_page * this.options.page
      var shown = this.element.find('li').length
      var loadmore = '<div class="button load-more">Cargar más</div>'
      if ((this.options.page === 1 && shown > 4) ||
            (this.options.totalPosts > shown) ||
            (this.options.totalPosts > maxshown)
            ) {
        controls.append(loadmore)
      }
      this.element.find('ul').after(controls)
    },
    loadMorePosts: function (askedPage) {
      var endpoint = this.options.base
      var container = this.element.find('ul')
      var args = container.data()
      args._embed = true
      var totalPosts = this.options.totalPosts

      if (totalPosts && args.offset >= totalPosts) {
                /* console.log('not asking more, reached end'); */
        return
      }
      var self = this
      $.getJSON(endpoint, args, function (posts, text, jqXHR) {
        var offset = container.data('offset')
        var total = jqXHR.getResponseHeader('x-wp-total')
        if (total) {
          self.option('totalPosts', total)
        }
        $.each(posts, function (idx, post) {
          var title = post.title.rendered
          var media = post._embedded['wp:featuredmedia'][0]
          var alt = media.alt_text
          var big = media.media_details.sizes.full
          var small = media.media_details.sizes.medium
          var insertPost = "<li style='display:none' class='contrib-post'>" +
                        "<div class='post-thumbnail'><a href='" + post.link + "'>" +
                        "<img src='" + small.source_url + "' " + "alt='" + alt + "' " +
                        "class='attachment-tie-large size-tie-large wp-post-image' " +
                        "srcset='" + big.source_url + ' ' + big.width + 'w, ' +
                        small.source_url + ' ' + small.width + "w'/></a></div>" +
                        "<h3><a style='width:97.5%;' href='" + post.link + "'>" + title + '</a></h3></li>'
          container
                        .data('offset', ++offset)
                        .append(insertPost)
        })
        if (this.options.page !== askedPage) {
          self._advancePage(askedPage)
        } else {
          this.renderList()
        }
      })
    },
    _advancePage: function (askedPage) {
      if (!this.options.totalPosts) {
        this.option('page', askedPage)
        return
      }
      if ((this.options.page * this.options.per_page) < this.element.find('li').length) {
        this.option('page', askedPage)
      }
    }

  })
  $(document).ready(function () {
    var contribPosts = $('.widget.category-posts li.contrib-post')
    if (contribPosts.length === 0 || contribPosts.length === 1) {
      var categoryWidget = $('.widget.categort-posts')
      if (categoryWidget.length > 0 && /M.s entregas/.test(categoryWidget.find('h3').text())) {
        categoryWidget.remove()
      }
    } else {
      contribPosts.each(function (i, el) {
        $(el).closest('.widget.category-posts').postsnavigator()
      })
    }
  })
})(jQuery)
