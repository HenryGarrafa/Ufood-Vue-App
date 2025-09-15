export const getRestaurantParams = (limit, page, filters) => {
  return new URLSearchParams({
    limit,
    page,
    ...(filters.q && { q: filters.q }),
    ...(filters.genres && filters.genres.length > 0 && { genres: filters.genres }),
    ...(filters.price_range && { price_range: filters.price_range }),
    ...(filters.lat && { lat: filters.lat }),
    ...(filters.lon && { lon: filters.lon }),
  })
}

export const getFormData = (name, email, password) => {
  const formData = new URLSearchParams()
  formData.append('name', name)
  formData.append('email', email)
  formData.append('password', password)

  return formData
}
