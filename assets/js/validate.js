// Object: Validator
function Validator(options) {

    function getParentOfInput(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    
    // Lưu tất cả các rule vào object, do 1 thẻ input có thể có nhiều rule
    var selectorRules = {}; 


    // Hàm thực hiện validate
    function Validate(inputElement, rule) {

        var errorElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorSelector)
        // Có thể sử dụng hàm getParentOfInput()
        // var errorElement = getParentOfInput(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;

        // rules: một array chứa các function(các rule) của inputElement hiện tại
        var rules = selectorRules[rule.selector]

        // Lặp qua từng rule và kiểm tra
        for(var i = 0; i < rules.length; i++) {

            switch(inputElement.type) {
                case 'radio': case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break
                default:
                    errorMessage = rules[i](inputElement.value)                   
            }
            // Nếu tìm thấy lỗi thì dừng và tiến hành xuất lỗi
            if(errorMessage)
                break
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage
            inputElement.closest(options.formGroupSelector).classList.add('invalid')
        }
        else {
            errorElement.innerText = ''
            inputElement.closest(options.formGroupSelector).classList.remove('invalid')

        }
        // Chuyển sang kiểu boolean: có lỗi(return true) / ko lỗi (return false)
        return !!errorMessage;
    }


    // Lấy ra form element cần validate
    var formElement = document.querySelector(options.form)

    if(formElement) {

        formElement.onsubmit = function(e) {

            e.preventDefault();

            var isValidForm = true;

            // Lặp qua từng rule và validate lun
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = Validate(inputElement, rule)

                // Có lỗi
                if(isValid)
                    isValidForm = false;              
            });
            
            
            if(isValidForm) {
                // Trường hợp submit vs javascript
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        
                        // switch(input.type) {
                        //     case 'radio': case 'checkbox':
                        //         values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                        //         break;
                        //     default: 
                        //         values[input.name] = input.value;
                                
                        // }
                        // Cach 2
                        switch(input.type) {
                            case 'checkbox':
                                if(input.matches(':checked')) {
                                    if(Array.isArray(values[input.name])) {
                                        values[input.name].push(input.value)
                                    }
                                    else{
                                        values[input.name] = [input.value]
                                    }
                                }
                                // Gán cho gender bằng chuỗi rỗng nếu ko có value
                                if(values[input.name] === undefined) {
                                  values[input.name] = ''
                                }
                                break;
                            case 'radio': 
                                if(input.matches(':checked')) {
                                    values[input.name] = input.value;
                                }
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default: 
                                values[input.name] = input.value;
                                
                        }
                        return values;
                    }, {})
                    options.onSubmit(formValues)
                } 
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            
            }
        }


        // lặp qua mỗi rule và handle(lắng nghe blur, input,...)
        options.rules.forEach(function(rule) {

            // Đẩy all các rule của inputElement vào object selectorRules
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] =  [rule.test]
            }

           var inputElements = formElement.querySelectorAll(rule.selector)

           Array.from(inputElements).forEach(function(inputElement) {
            // Xử lí khi blur ra khỏi input
            inputElement.onblur = function() {
                Validate(inputElement, rule)
            }
            // Xử lí mỗi khi user nhập vào input
            inputElement.oninput = function() {
                var errorElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorSelector)
                errorElement.innerText = ''
                inputElement.closest(options.formGroupSelector).classList.remove('invalid')
            }
        })
    })
}
}
// Define rules
// Nguyên tắc của các rules:
// 1. Xảy ra lỗi => in ra message lỗi
// 2. hợp lệ => ko in ra cái j cả (undefined)
Validator.isRequired = function(selector, message) {
    return {
        selector: selector, 
        test: function(value) {
                return value ? undefined : message || 'Vui lòng nhập trường này!'
        }
    }
}
Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là một email!'
        }
    }
}
Validator.minLength = function(selector, min, message) {
    return {
        selector: selector, 
        test: function(value) {
                return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự!`
        }
    }
}
Validator.maxLength = function(selector, max, message) {
    return {
        selector: selector, 
        test: function(value) {
                return value.length <= max ? undefined : message || `Vui lòng nhập ít hơn ${max} kí tự!`
        }
    }
}
Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác!'
        }
    }
}