package ru.grishagin.springreact;

import com.mysql.jdbc.exceptions.MySQLIntegrityConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import ru.grishagin.springreact.db.Employee;
import ru.grishagin.springreact.db.EmployeeDAO;

import java.util.List;

import static ru.grishagin.springreact.WebSocketConfiguration.MESSAGE_PREFIX;

@Controller
public class HomeController {
    private static final String NEW_NOTIFICATION = "newEmployee";
    private static final String UPDATE_NOTIFICATION = "updateEmployee";
    private static final String DELETE_NOTIFICATION = "deleteEmployee";

    @Autowired
    EmployeeDAO employeeDAO;

    @Autowired
    SimpMessagingTemplate webSocket;

    @RequestMapping(value = "/")
    public String index() {
        return "index";
    }

    @RequestMapping(value = "/getAll",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE,
            headers = {"Content-type=application/json"})
    public @ResponseBody  Response getAll(@RequestParam(required = false) Integer page,
                                                @RequestParam(required = false) Integer size){

        Response response = new Response();
        if(page != null && size != null) {
            response.setEmployees(employeeDAO.listEmployees(page*size, size));
        } else {
            response.setEmployees(employeeDAO.listEmployees());
        }
        response.setFullAmount(employeeDAO.getSize());
        response.setAttributes(employeeDAO.getAttributes());
        return response;
    }

    @RequestMapping(value = "/update",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE,
            headers = {"Content-type=application/json"})
    public @ResponseBody ResponseEntity edit(@RequestBody Employee employee){
        try {
            employeeDAO.update(employee);
            notifyClient(UPDATE_NOTIFICATION);
            return new ResponseEntity(HttpStatus.OK);
        } catch (MySQLIntegrityConstraintViolationException e){
            return new ResponseEntity(HttpStatus.PRECONDITION_FAILED);
        }
    }

    @RequestMapping(value = "/delete",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE,
            headers = {"Content-type=application/json"})
    public @ResponseBody Response delete(@RequestParam String id,
                                         @RequestParam String size){
        employeeDAO.delete(Integer.parseInt(id));
        notifyClient(DELETE_NOTIFICATION);
        return getAll(0, Integer.parseInt(size));
    }

    @RequestMapping(value = "/create",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE,
            headers = {"Content-type=application/json"})
    @ResponseStatus(value= HttpStatus.OK)
    public void create(@RequestBody Employee newEmployee){
        employeeDAO.create(newEmployee);
        notifyClient(NEW_NOTIFICATION);
        //return getAll(0, size);
    }

    //public void

    private void notifyClient(String messageType){
        webSocket.convertAndSend(MESSAGE_PREFIX+"/update" ,messageType);
    }

}