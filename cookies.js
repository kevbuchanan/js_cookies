function Cookies(type, time){
  this.type = type
  this.bake_time = time
  this.time_in_oven = 0
  this.state = "raw"
}

Cookies.prototype = {
  bake: function(){
    this.time_in_oven  ++
    this.update_status()
  },
  update_status: function(){
    if( this.time_in_oven < this.bake_time ){
      this.state = "still_gooey"
    } else if( this.time_in_oven == this.bake_time ) {
      this.state = "just_right"
    } else {
        this.state = "crispy"
    }
  }
}

function PrepTable(){
  this.batches = []
}

function Oven(){
  this.batches = []
}

Oven.prototype = {
  add_batch: function(cookies){
    this.batches.push(cookies)
  },
  bake_all: function(){
    function bake_one(element, array){
      element.bake()
    }
    this.batches.forEach(bake_one)
  }
}

var create_batch = function(tray) {
  event.preventDefault()
  var type = tray.find('input[name="batch_type"]').val()
  var time = tray.find('input[name="bake_time"]').val()
  var cookies = new Cookies(type, time)
  var prep_item = $('#prep_batches').find('li.hidden').first()
  var position = $(prep_item).data('order')
  prepTable.batches[parseInt(position)] = cookies
  prep_item.find('.type').text(cookies.type)
  prep_item.removeClass("hidden")
  tray.find('input[name="batch_type"]').val('')
  tray.find('input[name="bake_time"]').val('')
}

var bake_cookies = function(){
  oven.bake_all()
  oven.batches.forEach(function(element, index){
    var rack = $('#oven').find('td')[index]
    $(rack).addClass(element.state)
    $(rack).text(element.type + " ["+element.state+"]")
  })
}

var put_in_oven = function(tray) {
  var position = tray.parent().data('order')
  var batch = prepTable.batches[parseInt(position)]
  oven.add_batch(batch)
  prepTable.batches.splice(parseInt(position), 1)
  tray.closest('.prep_batch').addClass('hidden')
  var rack = $('#oven').find('td:contains("[empty]")').first()
  rack.addClass(batch.state)
  rack.text(batch.type + " ["+batch.state+"]")
  alert('Cookies in the oven!')
}

oven = new Oven()
prepTable = new PrepTable()

$(document).ready(function(){
  $('form').on('submit', function(event) {
    create_batch($(this))
  })

  $('.prep_batch').on('click', 'button', function(event){
    put_in_oven($(this))
  })

  $('#bake').on('click', function(event) {
    bake_cookies()
  })
})
