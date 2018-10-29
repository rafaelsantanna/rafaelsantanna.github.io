// Full Calendar
$(document).ready(function () {

    //Initialize Datepicker
    $('[data-toggle="datepicker"]').datepicker({
      language: 'pt-BR',
      autoHide:true,
      zIndex: 100000,
      startView: 1,
    });
    
    //Initializes the time picker
    $('#timeSchedule').mdtimepicker({
      format: 'hh:mm',
    }); 

    //Setup Fullcalendar
    $('#calendar').fullCalendar({
      locale: 'pt-BR',
      themeSystem: 'bootstrap4',
      height: 525,
      events: 'https://api-agenda-rafaeel16.c9users.io/api/schedules',
      dayClick: function (date, jsEvent, view) {
        //reset input
        $('#titleSchedule').val('');
        $('#timeSchedule').val('');
        $('#patientSchedule').val(0);
        // set date
        $('#modalSchedule #dateSchedule').val(date.format());
  
        // show modal schedule
        $('#modalSchedule').css('display', 'flex');
      },
      eventRender: function (event, element) {
        $(element)[0].setAttribute('data-id', event.id);
        $(element)[0].setAttribute('data-title', event.title);
        $(element)[0].setAttribute('data-start', event.start._i);
        $(element)[0].setAttribute('data-patient', event.patient);
        $(element)[0].setAttribute('data-time', event.time);
        $(element)[0].setAttribute('onclick', 'scheduleInfos(this)');
      }
    });
  
    //Close modal Schedule
    $('#modalSchedule .bg-overlay, #modalSchedule .btn-close i').click(function () {
      $('#modalSchedule').hide();
    });
  
    //Close modal Schedule Infos
    $('#modalScheduleInfos .bg-overlay, #modalScheduleInfos .btn-close i').click(function () {
      $('#modalScheduleInfos').hide();
    });
  
    //Save Schedule
    $('#saveSchedule').click(function () {
      var id = Math.floor(Math.random() * 100) + 1; // get return api
      var title = $('#titleSchedule').val();
      var start = $('#dateSchedule').val();
      var patient = $('#patientSchedule option:selected').text();
      var time = $('#timeSchedule').val();
  
      $.ajax({
        url: 'https://api-agenda-rafaeel16.c9users.io/api/schedules',
        type: "POST",
        data: {
          'title': title,
          'start': start,
          'time': time,
          'patient': patient
        },
        success: function (data) {
          $('#calendar').fullCalendar('renderEvent', {
            id: id,
            title: title,
            start: start,
            patient: patient,
            time: time
          });
          $('#modalSchedule').hide();
        },
        error: function (e) {
          console.log("Erro: " + e);
        }
      });
    });
  });
  
  // Schedule infos
  function scheduleInfos(element) {
  
    var id = $(element).data('id');
    var title = $(element).data('title');
    var patient = $(element).data('patient');
    var date = $(element).data('start');
    var time = $(element).data('time');
  
    $('#info-id').val(id);
    $('#info-title').text(title);
    $('#info-patient').text(patient);
    $('#info-date').text(date);
    $('#info-time').text(time);
  
    // show modal schedule
    $('#modalScheduleInfos').css('display', 'flex');
  
    // when opening the modal returns to the default
    $('#modalScheduleInfos .wrapper-infos').show();
    $('#modalScheduleInfos .wrapper-infos-edit').hide();
  }
  
  function removeEvent() {
    var id = $('#info-id').val();
    $.ajax({
      type: "DELETE",
      url: 'https://api-agenda-rafaeel16.c9users.io/api/schedules/' + id,
      success: function (data) {
        var element = '[data-id="' + $('#info-id').val() + '"]';
        $(element).remove();
        $('#modalScheduleInfos').hide();
      },
      error: function (e) {
        console.log("Erro: " + e);
      }
    });
  }
  
  function changeContentModalUpdate() {
    var id = '[data-id="' + $('#info-id').val() + '"]';
  
    var title = $('#info-title').text();
    var date = $('#info-date').text();
    var time = $('#info-time').text();
  
    $('#info-title-edit').val(title);
    $('#info-date-edit').val(date);
    $('#info-time-edit').val(time);
  
    $('#modalScheduleInfos .wrapper-infos').hide();
    $('#modalScheduleInfos .wrapper-infos-edit').show();
  }
  
  function updateEvent() {
    var id = $('#info-id').val();
    var title = $('#info-title-edit').val();
    var start = $('#info-date-edit').val();
    var time = $('#info-time-edit').val();
  
    $.ajax({
      type: "PUT",
      url: 'https://api-agenda-rafaeel16.c9users.io/api/schedules/' + id,
      data:{
        'title': title,
        'start': start,
        'time': time
      },
      success: function () {
        //reset calendar after update
        $('#calendar').fullCalendar('refetchEvents');
        $("#modalScheduleInfos").hide();
      },
      error: function (e) {
        console.log("Erro: " + e);
      }
    });
  }