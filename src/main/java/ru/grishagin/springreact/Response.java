package ru.grishagin.springreact;

import ru.grishagin.springreact.db.Employee;

import java.util.List;
import java.util.Map;

public class Response {
    private List<Employee> employees;
    private Map<String, String> attributes;
    private int fullAmount;

    public List<Employee> getEmployees() {
        return employees;
    }

    public void setEmployees(List<Employee> employees) {
        this.employees = employees;
    }

    public int getFullAmount() {
        return fullAmount;
    }

    public void setFullAmount(int fullAmount) {
        this.fullAmount = fullAmount;
    }

    public Map<String, String> getAttributes() {
        return attributes;
    }

    public void setAttributes(Map<String, String> attributes) {
        this.attributes = attributes;
    }
}
