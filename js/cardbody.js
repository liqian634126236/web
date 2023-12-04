window.startList = []
window.data = {}
window.rpcType = {}
// 获取输入框元素
const instanceInput = document.getElementById('instance')
// 初始 window.instance_name
window.instance_name = ''
var ins_block = ''

// 为输入框添加 input 事件监听器
instanceInput.addEventListener('input', function (event) {
  // 更新 window.instance_name 为输入框的值
  window.instance_name = event.target.value
})

var RPC = document.getElementById('RPC')

var cardBodyInput = document.getElementById('input-card-body')
var cardBodyOutput = document.getElementById('output-card-body')

window.selectedInputValues = {}
window.selectedOutputValues = {}
window.bench_now_ip = ''
var selectedRPC = ''
window.members_dict = { members: {} }
window.rpc_member_dict = {}

function deepCopy (obj) {
  if (typeof obj === 'function') {
    throw new TypeError('请传入正确的数据类型格式')
  }
  try {
    let data = JSON.stringify(obj)
    let newData = JSON.parse(data)
    return newData
  } catch (e) {
    console.log(e)
  }
}
function isEmptyObject (obj) {
  if (obj === null || obj === undefined) {
    return true
  }
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}

function parseParam (cardBody, outformGroup, param, paramName, selectedValues) {
  let formGroup = document.createElement('div')
  formGroup.className = 'form-group row flex-container flat-div divLeft'
  formGroup.style.marginTop = '20px'

  let label = document.createElement('label')
  label.className = 'col-sm-3 col-form-label txtRight'
  label.textContent = paramName

  let colDiv = document.createElement('div')
  colDiv.className = 'col-sm-6 flex-container flat-div'

  let select = document.createElement('select')
  //   select.id = paramName
  select.className = 'col-sm-12 custom-select text-left'
  if (param.type == 'enum' || param.type.indexOf('bool') !== -1) {
    if (param.type == 'enum') {
      if (param.repeated) {
        // Create the initial options for the select element
        let buttonGroupDiv = document.createElement('div')
        buttonGroupDiv.className = 'col-sm-3 text-right'

        for (let i = 0; i < param.options.length; i++) {
          let option = document.createElement('option')
          option.textContent = param.options[i]
          option.dataset.index = i
          select.appendChild(option)
        }
        let num = 0
        select.dataset.index = num
        select.value = '' //selectedValues[paramName] || ''
        // select.options[0].selected = true
        // console.log(select.options)
        if (
          param.repeated &&
          selectedValues[paramName] &&
          Array.isArray(selectedValues[paramName]) &&
          selectedValues[paramName].length >= 1
        ) {
          for (let j = 0; j < clonedSelect.options.length; j++) {
            if (select.options[j].value === selectedValues[paramName][num]) {
              // 找到匹配的 option 元素并将其设为选中状态
              select.options[j].selected = true
            }
          }
        }
        select.addEventListener('change', function (event) {
          let selectedIndex = select.dataset.index

          if (selectedIndex !== -1) {
            // Use the selectedIndex to update the selectedValues object
            if (
              selectedValues[paramName] &&
              Array.isArray(selectedValues[paramName])
            ) {
              selectedValues[paramName][selectedIndex] = event.target.value
            } else {
              selectedValues[paramName] = [event.target.value]
            }
          }
        })

        // 添加加号按钮
        let addButton = document.createElement('button')
        addButton.textContent = '+'
        addButton.className = 'btn btn-success btn-sm sb1'
        addButton.addEventListener('click', function (event) {
          let clonedSelect = select.cloneNode(true)
          clonedSelect.className = 'col-sm-12 custom-select text-left'
          clonedSelect.value = '' //设置repeated enum类型默认选项为空
          clonedSelect.dataset.index = ++num
          clonedSelect.addEventListener('change', function (event) {
            let selectedIndex = clonedSelect.dataset.index

            if (selectedIndex !== -1) {
              // Use the selectedIndex to update the selectedValues object
              if (
                selectedValues[paramName] &&
                Array.isArray(selectedValues[paramName])
              ) {
                selectedValues[paramName][selectedIndex] = event.target.value
              } else {
                selectedValues[paramName] = [event.target.value]
              }
            }
          })

          let label = document.createElement('label')
          label.className = 'col-sm-3 col-form-label txtRight'
          label.textContent = paramName
          let lcolDiv = document.createElement('div')
          lcolDiv.className = 'col-sm-7 flex-container flat-div'
          lcolDiv.appendChild(clonedSelect)
          formGroup.appendChild(label)
          formGroup.appendChild(lcolDiv)
        })

        // 添加减号按钮
        let removeButton = document.createElement('button')
        removeButton.textContent = '-'
        removeButton.className = 'btn btn-danger btn-sm sb2' // Add Bootstrap classes
        removeButton.addEventListener('click', function (event) {
          if (formGroup.childElementCount > 3) {
            let lastChildvalue = formGroup.lastElementChild
            lastChildvalue.remove()
            let lastChildlabel = formGroup.lastElementChild
            lastChildlabel.remove()
            --num
          }
          if (
            selectedValues[paramName] &&
            Array.isArray(selectedValues[paramName]) &&
            selectedValues[paramName].length > 1
          ) {
            selectedValues[paramName].pop()
          } else {
            console.info('last one!')
          }
        })

        buttonGroupDiv.appendChild(addButton)
        buttonGroupDiv.appendChild(removeButton)

        colDiv.appendChild(select)
        formGroup.appendChild(label)
        formGroup.appendChild(colDiv)
        formGroup.appendChild(buttonGroupDiv)

        if (
          param.repeated &&
          selectedValues[paramName] &&
          Array.isArray(selectedValues[paramName]) &&
          selectedValues[paramName].length > 1
        ) {
          num = selectedValues[paramName].length // 设置 num 为数组的长度

          for (let i = 1; i <= num; i++) {
            // 创建克隆的 select 元素
            let clonedSelect = select.cloneNode(true)
            clonedSelect.className = 'col-sm-12 custom-select text-left'
            clonedSelect.dataset.index = i

            // 检查是否存在选定的初始值
            if (
              selectedValues[paramName] &&
              Array.isArray(selectedValues[paramName]) &&
              selectedValues[paramName][i]
            ) {
              for (let j = 0; j < clonedSelect.options.length; j++) {
                if (
                  clonedSelect.options[j].value === selectedValues[paramName][i]
                ) {
                  // 找到匹配的 option 元素并将其设为选中状态
                  clonedSelect.options[j].selected = true
                }
              }
            }

            clonedSelect.addEventListener('change', function (event) {
              let selectedIndex = clonedSelect.dataset.index

              if (selectedIndex !== -1) {
                // Use the selectedIndex to update the selectedValues object
                if (
                  selectedValues[paramName] &&
                  Array.isArray(selectedValues[paramName])
                ) {
                  selectedValues[paramName][selectedIndex] = event.target.value
                } else {
                  selectedValues[paramName] = [event.target.value]
                }
              }
            })

            // 创建其他必要的元素，添加到表单中
            let label = document.createElement('label')
            label.className = 'col-sm-3 col-form-label txtRight'
            label.textContent = paramName
            let lcolDiv = document.createElement('div')
            lcolDiv.className = 'col-sm-7 flex-container flat-div'
            lcolDiv.appendChild(clonedSelect)
            formGroup.appendChild(label)
            formGroup.appendChild(lcolDiv)
          }
        }
      } else {
        // Create a single select element for non-repeated param
        for (let i = 0; i < param.options.length; i++) {
          let option = document.createElement('option')
          option.textContent = param.options[i]
          option.dataset.index = i
          select.appendChild(option)
        }

        select.value = '' //selectedValues[paramName] || ''

        if (selectedValues[paramName]) {
          for (let j = 0; j < clonedSelect.options.length; j++) {
            if (select.options[j].value === selectedValues[paramName]) {
              // 找到匹配的 option 元素并将其设为选中状态
              select.options[j].selected = true
            }
          }
        }

        select.addEventListener('change', function (event) {
          selectedValues[label.textContent] = event.target.value
        })

        colDiv.appendChild(select)
        formGroup.appendChild(label)
        formGroup.appendChild(colDiv) ////////////////////
      }
      outformGroup.appendChild(formGroup)
      cardBody.appendChild(outformGroup) // 将创建的表单元素添加到 cardBody 中
    } else if (param.type.indexOf('bool') !== -1) {
      if (param.repeated) {
        // Create the initial options for the select element
        let buttonGroupDiv = document.createElement('div')
        buttonGroupDiv.className = 'col-sm-3 text-right'

        let optionFalse = document.createElement('option')
        optionFalse.textContent = 'False'
        optionFalse.dataset.index = 0
        select.appendChild(optionFalse)
        let optionTrue = document.createElement('option')
        optionTrue.textContent = 'True'
        optionTrue.dataset.index = 1
        select.appendChild(optionTrue)

        let num = 0
        select.dataset.index = num
        select.value = '' //selectedValues[paramName] || ''

        if (
          param.repeated &&
          selectedValues[paramName] &&
          Array.isArray(selectedValues[paramName]) &&
          selectedValues[paramName].length >= 1
        ) {
          for (let j = 0; j < clonedSelect.options.length; j++) {
            if (select.options[j].value === selectedValues[paramName][num]) {
              // 找到匹配的 option 元素并将其设为选中状态
              select.options[j].selected = true
            }
          }
        }

        select.addEventListener('change', function (event) {
          let selectedIndex = select.dataset.index
          let boolValue = false

          if (selectedIndex !== -1) {
            // Use the selectedIndex to update the selectedValues object
            if (event.target.value.toLowerCase() === 'true') {
              boolValue = true
            } else if (event.target.value.toLowerCase() === 'false') {
              boolValue = false
            } else {
              // Handle other cases if needed
            }
            if (
              selectedValues[paramName] &&
              Array.isArray(selectedValues[paramName])
            ) {
              selectedValues[paramName][selectedIndex] = boolValue
            } else {
              selectedValues[paramName] = [boolValue]
            }
          }
        })

        // 添加加号按钮
        let addButton = document.createElement('button')
        addButton.textContent = '+'
        addButton.className = 'btn btn-success btn-sm sb1'
        addButton.addEventListener('click', function (event) {
          let clonedSelect = select.cloneNode(true)
          clonedSelect.className = 'col-sm-12 custom-select text-left'
          clonedSelect.value = '' //设置repeated enum类型默认选项为空
          clonedSelect.dataset.index = ++num
          clonedSelect.addEventListener('change', function (event) {
            let selectedIndex = clonedSelect.dataset.index
            let boolValue = false

            if (selectedIndex !== -1) {
              // Use the selectedIndex to update the selectedValues object
              if (event.target.value.toLowerCase() === 'true') {
                boolValue = true
              } else if (event.target.value.toLowerCase() === 'false') {
                boolValue = false
              } else {
                // Handle other cases if needed
              }
              if (
                selectedValues[paramName] &&
                Array.isArray(selectedValues[paramName])
              ) {
                selectedValues[paramName][selectedIndex] = boolValue
              } else {
                selectedValues[paramName] = [boolValue]
              }
            }
          })

          let label = document.createElement('label')
          label.className = 'col-sm-3 col-form-label txtRight'
          label.textContent = paramName
          let lcolDiv = document.createElement('div')
          lcolDiv.className = 'col-sm-7 flex-container flat-div'
          lcolDiv.appendChild(clonedSelect)
          formGroup.appendChild(label)
          formGroup.appendChild(lcolDiv)
        })

        // 添加减号按钮
        let removeButton = document.createElement('button')
        removeButton.textContent = '-'
        removeButton.className = 'btn btn-danger btn-sm sb2' // Add Bootstrap classes
        removeButton.addEventListener('click', function (event) {
          if (formGroup.childElementCount > 3) {
            let lastChildvalue = formGroup.lastElementChild
            lastChildvalue.remove()
            let lastChildlabel = formGroup.lastElementChild
            lastChildlabel.remove()
            --num
          }
          if (
            selectedValues[paramName] &&
            Array.isArray(selectedValues[paramName]) &&
            selectedValues[paramName].length > 1
          ) {
            selectedValues[paramName].pop()
          } else {
            console.info('last one!')
          }
        })

        buttonGroupDiv.appendChild(addButton)
        buttonGroupDiv.appendChild(removeButton)

        colDiv.appendChild(select)
        formGroup.appendChild(label)
        formGroup.appendChild(colDiv)
        formGroup.appendChild(buttonGroupDiv)
        if (
          param.repeated &&
          selectedValues[paramName] &&
          Array.isArray(selectedValues[paramName]) &&
          selectedValues[paramName].length > 1
        ) {
          num = selectedValues[paramName].length // 设置 num 为数组的长度

          for (let i = 1; i <= num; i++) {
            // 创建克隆的 select 元素
            let clonedSelect = select.cloneNode(true)
            clonedSelect.className = 'col-sm-12 custom-select text-left'
            clonedSelect.dataset.index = i

            // 检查是否存在选定的初始值
            if (
              selectedValues[paramName] &&
              Array.isArray(selectedValues[paramName]) &&
              selectedValues[paramName][i]
            ) {
              for (let j = 0; j < clonedSelect.options.length; j++) {
                if (
                  clonedSelect.options[j].value === selectedValues[paramName][i]
                ) {
                  // 找到匹配的 option 元素并将其设为选中状态
                  clonedSelect.options[j].selected = true
                }
              }
            }

            clonedSelect.addEventListener('change', function (event) {
              let selectedIndex = clonedSelect.dataset.index

              if (selectedIndex !== -1) {
                // Use the selectedIndex to update the selectedValues object
                if (
                  selectedValues[paramName] &&
                  Array.isArray(selectedValues[paramName])
                ) {
                  selectedValues[paramName][selectedIndex] = event.target.value
                } else {
                  selectedValues[paramName] = [event.target.value]
                }
              }
            })

            // 创建其他必要的元素，添加到表单中
            let label = document.createElement('label')
            label.className = 'col-sm-3 col-form-label txtRight'
            label.textContent = paramName
            let lcolDiv = document.createElement('div')
            lcolDiv.className = 'col-sm-7 flex-container flat-div'
            lcolDiv.appendChild(clonedSelect)
            formGroup.appendChild(label)
            formGroup.appendChild(lcolDiv)
          }
        }
      } else {
        // Create a single select element for non-repeated param
        let optionFalse = document.createElement('option')
        optionFalse.textContent = 'False'
        optionFalse.dataset.index = 0
        select.appendChild(optionFalse)
        let optionTrue = document.createElement('option')
        optionTrue.textContent = 'True'
        optionTrue.dataset.index = 1
        select.appendChild(optionTrue)

        select.value = '' //selectedValues[paramName] || ''

        if (selectedValues[paramName]) {
          for (let j = 0; j < clonedSelect.options.length; j++) {
            if (select.options[j].value === selectedValues[paramName]) {
              // 找到匹配的 option 元素并将其设为选中状态
              select.options[j].selected = true
            }
          }
        }

        select.addEventListener('change', function (event) {
          let boolValue = false
          if (event.target.value.toLowerCase() === 'true') {
            boolValue = true
          } else if (event.target.value.toLowerCase() === 'false') {
            boolValue = false
          } else {
            // Handle other cases if needed
          }
          selectedValues[label.textContent] = boolValue
        })

        colDiv.appendChild(select)
        formGroup.appendChild(label)
        formGroup.appendChild(colDiv) ////////////////////
      }
      outformGroup.appendChild(formGroup)
      cardBody.appendChild(outformGroup) // 将创建的表单元素添加到 cardBody 中
    }
  } else {
    if (param.repeated) {
      if (
        param.type.indexOf('int') !== -1 ||
        param.type.indexOf('string') !== -1 ||
        param.type.indexOf('float') !== -1 ||
        param.type.indexOf('double') !== -1 ||
        param.type.indexOf('byte') !== -1
      ) {
        let buttonGroupDiv = document.createElement('div')
        buttonGroupDiv.className = 'col-sm-3 text-right'

        let colDiv = document.createElement('div')
        colDiv.className = 'col-sm-6 flex-container flat-div'
        let label = document.createElement('label')
        label.className = 'col-sm-3 col-form-label txtRight'
        label.textContent = paramName

        let num = 0
        let default_inputElement = document.createElement('input')
        default_inputElement.className = 'col-sm-12 form-control text-left'

        default_inputElement.dataset.index = num
        default_inputElement.value = '' //selectedValues[paramName] || ''

        if (
          param.repeated &&
          selectedValues[paramName] &&
          Array.isArray(selectedValues[paramName]) &&
          selectedValues[paramName].length >= 1
        ) {
          let tempValue
          if (param.type.indexOf('int') !== -1) {
            tempValue = parseInt(selectedValues[paramName][num])
          } else if (
            param.type.indexOf('float') !== -1 ||
            param.type.indexOf('double') !== -1
          ) {
            tempValue = parseFloat(selectedValues[paramName][num])
          } else {
            tempValue = selectedValues[paramName][num]
          }
          default_inputElement.value = tempValue
        }

        default_inputElement.addEventListener('change', function (event) {
          // 在这里处理事件发生时的逻辑
          let selectedIndex = default_inputElement.dataset.index
          if (selectedIndex !== -1) {
            // Use the selectedIndex to update the selectedValues object
            let tempValue
            if (param.type.indexOf('int') !== -1) {
              tempValue = parseInt(event.target.value)
            } else if (
              param.type.indexOf('float') !== -1 ||
              param.type.indexOf('double') !== -1
            ) {
              tempValue = parseFloat(event.target.value)
            } else {
              tempValue = event.target.value
            }

            if (
              selectedValues[paramName] &&
              Array.isArray(selectedValues[paramName])
            ) {
              selectedValues[paramName][selectedIndex] = tempValue
            } else {
              selectedValues[paramName] = [tempValue]
            }
          }
        })

        let addButton = document.createElement('button')
        addButton.textContent = '+'
        addButton.className = 'btn btn-success btn-sm sb1'
        addButton.addEventListener('click', function (event) {
          let inputElement = document.createElement('input')
          inputElement.className = 'col-sm-12 text-left form-control'

          inputElement.dataset.index = ++num
          inputElement.value = '' //selectedValues[paramName] || ''

          inputElement.addEventListener('change', function (event) {
            // 在这里处理事件发生时的逻辑
            let selectedIndex = inputElement.dataset.index
            if (selectedIndex !== -1) {
              // Use the selectedIndex to update the selectedValues object
              let tempValue
              if (param.type.indexOf('int') !== -1) {
                tempValue = parseInt(event.target.value)
              } else if (
                param.type.indexOf('float') !== -1 ||
                param.type.indexOf('double') !== -1
              ) {
                tempValue = parseFloat(event.target.value)
              } else {
                tempValue = event.target.value
              }

              if (
                selectedValues[paramName] &&
                Array.isArray(selectedValues[paramName])
              ) {
                selectedValues[paramName][selectedIndex] = tempValue
              } else {
                selectedValues[paramName] = [tempValue]
              }
            }
          })
          let label = document.createElement('label')
          label.className = 'col-sm-3 col-form-label txtRight'
          label.textContent = paramName
          let colDiv = document.createElement('div')
          colDiv.className = 'col-sm-7 flex-container flat-div'
          colDiv.appendChild(inputElement)
          formGroup.appendChild(label)
          formGroup.appendChild(colDiv)
        })

        // 添加减号按钮
        let removeButton = document.createElement('button')
        removeButton.textContent = '-'
        removeButton.className = 'btn btn-danger btn-sm sb2' // Add Bootstrap classes
        removeButton.addEventListener('click', function (event) {
          if (formGroup.childElementCount > 3) {
            let lastChildvalue = formGroup.lastElementChild
            lastChildvalue.remove()
            let lastChildlabel = formGroup.lastElementChild
            lastChildlabel.remove()
            --num
          }
          if (
            selectedValues[paramName] &&
            Array.isArray(selectedValues[paramName]) &&
            selectedValues[paramName].length > 1
          ) {
            selectedValues[paramName].pop()
          } else {
            console.info('last one!')
          }
        })

        buttonGroupDiv.appendChild(addButton)
        buttonGroupDiv.appendChild(removeButton)

        colDiv.appendChild(default_inputElement)
        formGroup.appendChild(label)
        formGroup.appendChild(colDiv)
        formGroup.appendChild(buttonGroupDiv)

        if (
          param.repeated &&
          selectedValues[paramName] &&
          Array.isArray(selectedValues[paramName]) &&
          selectedValues[paramName].length > 1
        ) {
          num = selectedValues[paramName].length // 设置 num 为数组的长度

          for (let i = 1; i <= num; i++) {
            // 创建克隆的 select 元素
            let inputElement = document.createElement('input')
            inputElement.className = 'col-sm-12 text-left form-control'

            inputElement.dataset.index = i
            inputElement.value = '' //selectedValues[paramName] || ''
            let clonetempValue
            if (param.type.indexOf('int') !== -1) {
              clonetempValue = parseInt(selectedValues[paramName][i])
            } else if (
              param.type.indexOf('float') !== -1 ||
              param.type.indexOf('double') !== -1
            ) {
              clonetempValue = parseFloat(selectedValues[paramName][i])
            } else {
              clonetempValue = selectedValues[paramName][i]
            }
            inputElement.value = clonetempValue

            inputElement.addEventListener('change', function (event) {
              // 在这里处理事件发生时的逻辑
              let selectedIndex = inputElement.dataset.index
              if (selectedIndex !== -1) {
                // Use the selectedIndex to update the selectedValues object
                let tempValue
                if (param.type.indexOf('int') !== -1) {
                  tempValue = parseInt(event.target.value)
                } else if (
                  param.type.indexOf('float') !== -1 ||
                  param.type.indexOf('double') !== -1
                ) {
                  tempValue = parseFloat(event.target.value)
                } else {
                  tempValue = event.target.value
                }

                if (
                  selectedValues[paramName] &&
                  Array.isArray(selectedValues[paramName])
                ) {
                  selectedValues[paramName][selectedIndex] = tempValue
                } else {
                  selectedValues[paramName] = [tempValue]
                }
              }
            })
            let label = document.createElement('label')
            label.className = 'col-sm-3 col-form-label txtRight'
            label.textContent = paramName
            let colDiv = document.createElement('div')
            colDiv.className = 'col-sm-7 flex-container flat-div'
            colDiv.appendChild(inputElement)
            formGroup.appendChild(label)
            formGroup.appendChild(colDiv)
          }
        }

        outformGroup.appendChild(formGroup)
        cardBody.appendChild(outformGroup)
      } else if (param.type.indexOf('message') !== -1) {
        console.info('...')
      } else {
        // Create a single select element for non-repeated param
        let num = 0
        let default_inputElement = document.createElement('input')
        default_inputElement.className = 'col-sm-8 text-left form-control'
        default_inputElement.dataset.index = num
        default_inputElement.value = '' //selectedValues[paramName] || ''

        if (
          param.repeated &&
          selectedValues[paramName] &&
          Array.isArray(selectedValues[paramName]) &&
          selectedValues[paramName].length >= 1
        ) {
          let tempValue
          if (param.type.indexOf('int') !== -1) {
            tempValue = parseInt(selectedValues[paramName][num])
          } else if (
            param.type.indexOf('float') !== -1 ||
            param.type.indexOf('double') !== -1
          ) {
            tempValue = parseFloat(selectedValues[paramName][num])
          } else {
            tempValue = selectedValues[paramName][num]
          }
          default_inputElement.value = tempValue
        }

        default_inputElement.addEventListener('change', function (event) {
          // 在这里处理事件发生时的逻辑
          selectedValues[paramName] = event.target.value
        })
        // let colDiv = document.createElement('div')
        // colDiv.className = 'col-sm-8'
        // 用前面的colDiv
        colDiv.appendChild(default_inputElement)
        formGroup.appendChild(label)
        formGroup.appendChild(colDiv)
      }
    } else {
      // Create a single select element for non-repeated param
      let num = 0
      let default_inputElement = document.createElement('input')
      default_inputElement.className = 'col-sm-8 text-left form-control'
      default_inputElement.dataset.index = num
      default_inputElement.value = selectedValues[paramName] || ''

      if (selectedValues[paramName]) {
        let tempValue
        if (param.type.indexOf('int') !== -1) {
          tempValue = parseInt(selectedValues[paramName])
        } else if (
          param.type.indexOf('float') !== -1 ||
          param.type.indexOf('double') !== -1
        ) {
          tempValue = parseFloat(selectedValues[paramName])
        } else {
          tempValue = selectedValues[paramName]
        }
        default_inputElement.value = tempValue
      }

      default_inputElement.addEventListener('change', function (event) {
        let tempValue
        if (param.type.indexOf('int') !== -1) {
          tempValue = parseInt(event.target.value)
        } else if (
          param.type.indexOf('float') !== -1 ||
          param.type.indexOf('double') !== -1
        ) {
          tempValue = parseFloat(event.target.value)
        } else {
          tempValue = event.target.value
        }
        // 在这里处理事件发生时的逻辑
        selectedValues[paramName] = tempValue
      })
      let colDiv = document.createElement('div')
      colDiv.className = 'col-sm-8 flex-container flat-div'
      colDiv.appendChild(default_inputElement)
      formGroup.appendChild(label)
      formGroup.appendChild(colDiv)
    }
    outformGroup.appendChild(formGroup)
    cardBody.appendChild(outformGroup)
  }
}

function createParamFormGroup (paramToUse, selectedValues, cardBody) {
  let formGroup = document.createElement('div')
  formGroup.className = 'form-group row collapsibleDiv flex-container flat-div' //collapsibleDiv
  formGroup.style.marginTop = '20px'

  let toggleButton = document.createElement('button')
  toggleButton.textContent = '∆'
  toggleButton.className = 'col-sm-12 sb4'

  toggleButton.addEventListener('click', function () {
    if (formGroup.style.display === 'none') {
      formGroup.style.display = 'block' // 折叠的时候展开
      toggleButton.textContent = '∆'
      toggleButton.className = 'col-sm-12 sb4'
    } else {
      formGroup.style.display = 'none' // 展开的时候折叠
      toggleButton.textContent = '∇'
      toggleButton.className = 'col-sm-12 sb3'
    }
  })
  cardBody.appendChild(toggleButton)

  for (let paramName in paramToUse) {
    let param = paramToUse[paramName]

    if (param.tag === 'nest') {
      let n_formGroup = document.createElement('div')
      n_formGroup.className = ' col-sm-12 row flat-div'
      n_formGroup.style.marginTop = '20px'
      let num = 0
      let nestedFormGroup = document.createElement('div')
      nestedFormGroup.className = 'col-sm-12 row flat-div'

      nestedFormGroup.dataset.index = num
      nestedFormGroup.value = selectedValues[paramName] || ''

      let tempselectedValues = {}

      if (
        selectedValues[paramName] &&
        Array.isArray(
          selectedValues[paramName] && selectedValues[paramName].length > 0
        )
      ) {
        tempselectedValues = selectedValues[paramName][num]
      } else {
        console.info(`${paramName} dict is empty!`)
      }

      if (param.repeated && isEmptyObject(tempselectedValues)) {
        selectedValues[paramName] = [tempselectedValues]
      } else {
        selectedValues[paramName] = tempselectedValues
      }
      createParamFormGroup(param.params, tempselectedValues, nestedFormGroup)

      let buttonGroupDiv = document.createElement('div')
      buttonGroupDiv.className = 'col-sm-2 text-right'
      // aaaaaaaaaaaaaa0000000
      if (param.repeated) {
        let addButton = document.createElement('button')
        addButton.textContent = '+'
        addButton.className = 'btn btn-info btn-sm'
        addButton.addEventListener('click', function (event) {
          let clonedNestedFormGroup = document.createElement('div')
          clonedNestedFormGroup.className = 'col-sm-12 row flat-div'

          clonedNestedFormGroup.dataset.index = ++num
          clonedNestedFormGroup.value = selectedValues[paramName] || ''

          let CloneTempselectedValues = {}

          createParamFormGroup(
            param.params,
            CloneTempselectedValues,
            clonedNestedFormGroup
          )

          let selectedIndex = clonedNestedFormGroup.dataset.index
          if (selectedIndex !== -1) {
            // Use the selectedIndex to update the selectedValues object
            if (
              selectedValues[paramName] &&
              Array.isArray(selectedValues[paramName])
            ) {
              selectedValues[paramName][selectedIndex] = CloneTempselectedValues
            } else {
              selectedValues[paramName] = [CloneTempselectedValues]
            }
          }
          let label = document.createElement('label')
          label.className = 'col-sm-3 col-form-label txtRight' // txtCenter
          label.textContent = paramName
          let colDiv = document.createElement('div')
          colDiv.className = 'col-sm-7 flex-container flat-div'
          colDiv.appendChild(clonedNestedFormGroup)
          n_formGroup.appendChild(label)
          n_formGroup.appendChild(colDiv)
        })

        // 添加减号按钮
        let removeButton = document.createElement('button')
        removeButton.textContent = '-'
        removeButton.className = 'btn btn-dark btn-sm' // Add Bootstrap classes
        removeButton.addEventListener('click', function (event) {
          if (n_formGroup.childElementCount > 3) {
            let lastChildvalue = n_formGroup.lastElementChild
            lastChildvalue.remove()
            let lastChildlabel = n_formGroup.lastElementChild
            lastChildlabel.remove()
            --num
          }
          if (
            selectedValues[paramName] &&
            Array.isArray(selectedValues[paramName]) &&
            selectedValues[paramName].length > 1
          ) {
            selectedValues[paramName].pop()
          } else {
            console.info('last one nest!')
          }
        })

        buttonGroupDiv.appendChild(addButton)
        buttonGroupDiv.appendChild(removeButton)
      }
      // aaaaaaaaaaaaaa0000000

      let label = document.createElement('label')
      label.className = 'col-sm-3 col-form-label txtRight' // txtCenter
      label.textContent = paramName
      let colDiv = document.createElement('div')
      colDiv.className = 'col-sm-7 flex-container flat-div'
      colDiv.appendChild(nestedFormGroup)
      n_formGroup.appendChild(label)
      n_formGroup.appendChild(colDiv)
      n_formGroup.appendChild(buttonGroupDiv)
      // 在这初始化的时候，如果是repeated，就会多次创建，但是不会赋值
      if (
        param.repeated &&
        selectedValues[paramName] &&
        Array.isArray(selectedValues[paramName]) &&
        selectedValues[paramName].length > 1
      ) {
        num = selectedValues[paramName].length // 设置 num 为数组的长度
        for (let i = 1; i <= num; i++) {
          let clonedNestedFormGroup = document.createElement('div')
          clonedNestedFormGroup.className = 'col-sm-12 row flat-div'

          clonedNestedFormGroup.dataset.index = i
          clonedNestedFormGroup.value = selectedValues[paramName][i] || ''

          let CloneTempselectedValues = {}
          if (
            Array.isArray(
              selectedValues[paramName] &&
                !isEmptyObject(selectedValues[paramName][num])
            )
          ) {
            CloneTempselectedValues = selectedValues[paramName][num]
          } else {
            console.info(`${paramName} dict is empty!`)
          }

          createParamFormGroup(
            param.params,
            CloneTempselectedValues,
            clonedNestedFormGroup
          )

          let label = document.createElement('label')
          label.className = 'col-sm-3 col-form-label txtRight'
          label.textContent = paramName
          let colDiv = document.createElement('div')
          colDiv.className = 'col-sm-7 flex-container flat-div'
          colDiv.appendChild(clonedNestedFormGroup)
          n_formGroup.appendChild(label)
          n_formGroup.appendChild(colDiv)
        }
      }

      formGroup.appendChild(n_formGroup)
      cardBody.appendChild(formGroup)
    } else {
      let innerformGroup = document.createElement('div')
      innerformGroup.className =
        'form-group row flex-container flat-div divLeft'
      innerformGroup.style.marginTop = '20px'
      parseParam(formGroup, innerformGroup, param, paramName, selectedValues)
      cardBody.appendChild(formGroup)
    }
  }
}

function populateCard (cardBody, selectedValues, put_type) {
  let selectedVa = document.getElementById('selectedService')
  let selectedServiceName = selectedVa.value
    // selectedVa.options[selectedVa.selectedIndex].textContent
  cardBody.innerHTML = ''
  // cardBody.className = 'form-group row col-sm-12 bordered-div'

  selectedRPC = RPC.options[RPC.selectedIndex].textContent
  if (selectedRPC in window.data.Req_Resp) {
    var rpcData = window.data.Req_Resp[selectedRPC]
    var put_name = rpcData[put_type]

    if (!isEmptyObject(selectedValues[put_name])) {
      // 如果不为空对象，不执行初始化操作
      window.members_dict['members'][put_name] = selectedValues[put_name]
    } else {
      selectedValues[put_name] = {}
      window.members_dict['members'][put_name] = selectedValues[put_name]
    }

    window.rpcType[selectedRPC] =
      window.data.Req_Resp[selectedRPC]['rpc_method']

    if (rpcData[put_name]) {
      let MessageNamelabel = document.createElement('label')
      MessageNamelabel.className = 'col-sm-12 col-form-label txtCenter'
      if (window.instance_name) {
        ins_block = ':(' + window.instance_name + ')'
      } else {
        ins_block = ''
      }
      MessageNamelabel.textContent =
        selectedServiceName + ':' + selectedRPC + ins_block + ':' + put_name
      MessageNamelabel.id = put_name

      let MessageNamelabel_formGroup = document.createElement('div')
      MessageNamelabel_formGroup.className = 'col-sm-12'
      MessageNamelabel_formGroup.appendChild(MessageNamelabel)

      let MessageDiv = document.createElement('div')
      MessageDiv.className = 'col-sm-12 flex-container flat-div'
      MessageNamelabel_formGroup.appendChild(MessageDiv)
      cardBody.appendChild(MessageNamelabel_formGroup)

      let paramToUse = rpcData[put_name]

      createParamFormGroup(paramToUse, selectedValues[put_name], cardBody)
    }
  }
}

function handleInputChange (event, singleCardBody) {
  let selectedOption =
    event.target.options[event.target.selectedIndex].textContent
  if (window.instance_name) {
    ins_block = ':(' + window.instance_name + ')'
  } else {
    ins_block = ''
  }
  if (
    window.rpc_member_dict[selectedOption + ins_block] == null ||
    window.rpc_member_dict[selectedOption + ins_block] == undefined
  ) {
    window.rpc_member_dict[selectedOption + ins_block] = {}
    window.rpc_member_dict[selectedOption + ins_block]['input'] = {}
    window.rpc_member_dict[selectedOption + ins_block]['output'] = {}
    window.selectedInputValues =
      window.rpc_member_dict[selectedOption + ins_block]['input']
    window.selectedOutputValues =
      window.rpc_member_dict[selectedOption + ins_block]['output']
    console.log(JSON.stringify(window.selectedInputValues))
  } else {
    window.selectedInputValues =
      window.rpc_member_dict[selectedOption + ins_block]['input']
  }
  let cardId = selectedOption + ':' + window.instance_name + ':input'
  let existingCardBody = document.getElementById(cardId)

  if (!existingCardBody) {
    existingCardBody = document.createElement('div')
    existingCardBody.className = 'form-group col-sm-12 bordered-div'
    existingCardBody.id = cardId
    singleCardBody.appendChild(existingCardBody)

    window.rpc_member_dict[selectedOption + ins_block]['input'] = {}
    populateCard(
      existingCardBody,
      window.rpc_member_dict[selectedOption + ins_block]['input'],
      'input_name'
    )
  }
}

// Handle output change
function handleOutputChange (event, singleCardBody) {
  let selectedOption =
    event.target.options[event.target.selectedIndex].textContent
  if (window.instance_name) {
    ins_block = ':(' + window.instance_name + ')'
  } else {
    ins_block = ''
  }
  if (
    window.rpc_member_dict[selectedOption + ins_block] == null ||
    window.rpc_member_dict[selectedOption + ins_block] == undefined
  ) {
    window.rpc_member_dict[selectedOption + ins_block] = {}
    window.rpc_member_dict[selectedOption + ins_block]['input'] = {}
    window.rpc_member_dict[selectedOption + ins_block]['output'] = {}
    window.selectedInputValues =
      window.rpc_member_dict[selectedOption + ins_block]['input']
    window.selectedOutputValues =
      window.rpc_member_dict[selectedOption + ins_block]['output']
    console.log(JSON.stringify(window.selectedOutputValues))
  } else {
    window.selectedOutputValues =
      window.rpc_member_dict[selectedOption + ins_block]['output']
  }
  let cardId = selectedOption + ':' + window.instance_name + ':output'
  let existingCardBody = document.getElementById(cardId)

  if (!existingCardBody) {
    existingCardBody = document.createElement('div')
    existingCardBody.className = 'form-group col-sm-12 bordered-div'
    existingCardBody.id = cardId
    singleCardBody.appendChild(existingCardBody)

    window.rpc_member_dict[selectedOption + ins_block]['output'] = {}
    populateCard(
      existingCardBody,
      window.rpc_member_dict[selectedOption + ins_block]['output'],
      'output_name'
    )
  }
}
const memberCardBody = document.getElementById('member-card-body')
RPC.addEventListener('change', function (event) {
  let selectedOption =
    event.target.options[event.target.selectedIndex].textContent
  let singleCardBody = document.getElementById(
    selectedOption + ':' + window.instance_name + ':member'
  )
  if (!singleCardBody) {
    singleCardBody = document.createElement('div')
    singleCardBody.id = selectedOption + ':' + window.instance_name + ':member'
    singleCardBody.className =
      'form-group col-sm-12 bordered-div slideContent slideDraggable'

    memberCardBody.appendChild(singleCardBody)
  }
  handleInputChange(event, singleCardBody)
  handleOutputChange(event, singleCardBody)
  console.log(JSON.stringify(window.rpc_member_dict))
  console.log(JSON.stringify(window.selectedInputValues))
  console.log(JSON.stringify(window.selectedOutputValues))
  let selectedContent = document.getElementById(
    selectedOption + ':' + window.instance_name + ':member'
  )
  memberCardBody.insertBefore(selectedContent, memberCardBody.firstChild)
})
var previousSelectedOption = '' // 用于存储之前的选中选项
var previousSelectedIndex = -1
instanceInput.addEventListener('input', function (event) {
  // 更新 window.instance_name 为输入框的值
  var selectedContent
  if (RPC.selectedIndex != -1) {
    var selectedOption = RPC.options[RPC.selectedIndex]
    selectedContent = document.getElementById(
      selectedOption?.textContent + ':' + window.instance_name + ':member'
    )
    previousSelectedOption = selectedOption.textContent
    previousSelectedIndex = RPC.selectedIndex
  } else {
    selectedContent = document.getElementById(
      previousSelectedOption + ':' + window.instance_name + ':member'
    )
  }
  if (selectedContent) {
    RPC.selectedIndex = previousSelectedIndex
    memberCardBody.insertBefore(selectedContent, memberCardBody.firstChild)
  } else {
    RPC.selectedIndex = -1
  }
})
// var isDragging = false;
// var startX = 0;
// var initialScrollX = 0;

// document.addEventListener("mousedown", function (event) {
//   if (event.target.classList.contains("draggable")) {
//     let slidingDiv = document.querySelector(".slidingDiv");
//     isDragging = true;
//     startX = event.clientX;
//     initialScrollX = slidingDiv.scrollLeft;
//   }
// });

// document.addEventListener("mousemove", function (event) {
//   if (isDragging) {
//     let slidingDiv = document.querySelector(".slidingDiv");
//     let distance = event.clientX - startX;
//     slidingDiv.scrollLeft = initialScrollX - distance;
//   }
// });

// document.addEventListener("mouseup", function () {
//   isDragging = false;
// });
