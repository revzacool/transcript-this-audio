// public/script.js
$(document).ready(function () {
  $('#transcriptionForm').submit(function (event) {
    event.preventDefault()

    const audioFile = $('#audioFile')[0].files[0]
    const formData = new FormData()
    formData.append('audio', audioFile)

    $.ajax({
      url: '/transcribe',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        $('#result').text('Transcription: ' + response)
      },
      error: function (xhr, status, error) {
        $('#result').text('Error: ' + xhr.responseText)
      }
    })
  })
})
