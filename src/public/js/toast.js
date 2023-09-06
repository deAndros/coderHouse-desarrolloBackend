const successToast = Swal.mixin({
  toast: true,

  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  },
})

const fireSuccessToast = (message) =>
  successToast.fire({
    icon: 'success',
    title: message,
  })

const errorToast = Swal.mixin({
  toast: true,
})

const fireErrorToast = (message) =>
  errorToast.fire({
    icon: 'error',
    title: message,
  })
